import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { postActivityLog } from "../api/activityLogs";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";

export default function Notifications() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
  const navigate = useNavigate();
  // Halaman ini hanya untuk Messages (tanpa tab General)

  // Common UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownContainerRef = useRef(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  // Header shared state
  const menus = [
    "Minitok ONT",
    "Minitok AP",
    "Minitok Node B",
    "Minitok ONT Entherprise",
    "Request Outbond",
    "User List",
  ];
  const hasDropdown = (menu) => !["Request Outbond", "User List"].includes(menu);
  const [activeMenu, setActiveMenu] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Messages tab state
  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [msgTab, setMsgTab] = useState("inbox"); // inbox | sent | history
  const [showAddMessage, setShowAddMessage] = useState(false);
  const [messageTo, setMessageTo] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [messagesInbox, setMessagesInbox] = useState([]);
  const [messagesSent, setMessagesSent] = useState([]);
  const [messagesHistory, setMessagesHistory] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [chatWith, setChatWith] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [convMap, setConvMap] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({ inbox_unread: 0, total_unread: 0 });
  const updatesCursorRef = useRef(null);
  const chatMessagesRef = useRef([]);
  const updatesTimerRef = useRef(null);
  // Notifications tabs
  const [notifTab, setNotifTab] = useState("messages"); // general | messages
  const [generalLogs, setGeneralLogs] = useState([]);
  const [generalLoading, setGeneralLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch current user (untuk arah bubble)
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/me`);
        const me = res.data?.user || null;
        setCurrentUserId(me?.id || null);
        setCurrentUser(me || null);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMe();
  }, [API_BASE_URL]);

  // Fetch general logs when General tab active
  useEffect(() => {
    const loadGeneral = async () => {
      if (notifTab !== "general") return;
      setGeneralLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/activity-logs`, { params: { per_page: 50, page: 1 } });
        const list = res.data?.data || [];
        setGeneralLogs(list);
      } catch (e) {
        console.error(e);
        setGeneralLogs([]);
      } finally {
        setGeneralLoading(false);
      }
    };
    loadGeneral();
  }, [API_BASE_URL, notifTab]);

  const logoutNow = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`);
    } catch (e) {
      // ignore
    }
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("auth_token");
    navigate("/login", { replace: true });
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === "Minitok ONT") navigate("/minitok-ont/rekap");
    if (menu === "Minitok AP") navigate("/minitok-ap/rekap");
    if (menu === "Minitok Node B") navigate("/minitok-nodeb/rekap");
    if (menu === "Minitok ONT Entherprise") navigate("/minitok-ontentherprise/rekap");
    if (menu === "Request Outbond") navigate("/request-outbond");
    if (menu === "User List") navigate("/request-userlist");
  };

  // Fetch users for Messages "To" dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users`, { params: { per_page: 100, page: 1 } });
        const data = res.data?.data || [];
        const list = data.map((u) => ({ id: u.id, name: `${u.first_name} ${u.last_name}`.trim() || u.email, email: u.email }));
        setUsers(list);
        const map = {};
        list.forEach((u) => (map[u.id] = u));
        setUserMap(map);
      } catch (e) {
        console.error(e);
        setUsers([]);
        setUserMap({});
      }
    };
    fetchUsers();
  }, [API_BASE_URL]);

  const loadConversations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/conversations`, { params: { page: 1, per_page: 100 } });
      const list = res.data?.data || [];
      setConversations(list);
      const map = {};
      list.forEach((c) => {
        map[c.id] = { partner_id: c.partner_id, partner_name: c.partner_name };
      });
      setConvMap(map);
    } catch (e) {
      console.error(e);
      setConversations([]);
      setConvMap({});
    }
  };

  const mapMsgRow = (m) => {
    const conv = convMap[m.conversation_id] || {};
    const toIdFallback = m.partner_id || m.to_id || m.receiver_id || null;
    const toNameFallback = m.partner_name || m.toName || m.receiver_name || "-";
    return {
      id: m.id,
      sender_id: m.sender_id,
      conversation_id: m.conversation_id,
      toId: conv.partner_id ?? toIdFallback,
      toName: conv.partner_name ?? toNameFallback,
      text: m.text || "",
      status: m.status || "",
      created_at: m.created_at || m.updated_at || null,
    };
  };

  const loadFolder = async (folder) => {
    try {
      if (!convMap || Object.keys(convMap).length === 0) {
        await loadConversations();
      }
      const res = await axios.get(`${API_BASE_URL}/api/messages`, { params: { folder, page: 1, per_page: 100, q: searchTerm || undefined } });
      const list = res.data?.data || [];
      const rows = list.map(mapMsgRow);
      if (Array.isArray(rows) && rows.length) {
        const convIndex = {};
        conversations.forEach((c) => (convIndex[c.id] = c));
        rows.forEach((r, i) => {
          if ((!r.toId || !r.toName) && r.conversation_id && convIndex[r.conversation_id]) {
            rows[i] = {
              ...r,
              toId: r.toId || convIndex[r.conversation_id].partner_id,
              toName: r.toName || convIndex[r.conversation_id].partner_name,
            };
          }
        });
      }
      if (folder === "inbox") setMessagesInbox(rows);
      else if (folder === "sent") setMessagesSent(rows);
      else setMessagesHistory(rows);
    } catch (e) {
      console.error(e);
      if (folder === "inbox") setMessagesInbox([]);
      else if (folder === "sent") setMessagesSent([]);
      else setMessagesHistory([]);
    }
  };

  const loadUnread = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/unread-count`);
      const data = res.data?.data || {};
      setUnreadCounts({
        inbox_unread: Number(data.inbox_unread || 0),
        total_unread: Number(data.total_unread || 0),
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (notifTab !== "messages") return;
    (async () => {
      await loadConversations();
      await Promise.all([loadFolder("inbox"), loadFolder("sent")]);
      await loadUnread();
      if (!updatesCursorRef.current) updatesCursorRef.current = new Date().toISOString();
  })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL, notifTab]);

  const updateRowRead = (id) => {
    setMessagesInbox((prev) => prev.map((r) => (r.id === id ? { ...r, status: "read" } : r)));
    setMessagesSent((prev) => prev.map((r) => (r.id === id ? { ...r, status: "read" } : r)));
    setMessagesHistory((prev) => prev.map((r) => (r.id === id ? { ...r, status: "read" } : r)));
  };

  const markMessageRead = async (row) => {
    try {
      if (!row?.id) return;
      await axios.post(`${API_BASE_URL}/api/messages/${row.id}/read`);
      updateRowRead(row.id);
      await loadUnread();
    } catch (e) {
      console.error(e);
    }
  };

  const markConversationRead = async (partnerId) => {
    try {
      if (!partnerId) return;
      const res = await axios.get(`${API_BASE_URL}/api/messages/conversations/${partnerId}/messages`, { params: { page: 1, per_page: 100 } });
      const list = res.data?.data || [];
      const unreadIncoming = list.filter((m) => m.status !== "read" && m.sender_id && currentUserId && m.sender_id !== currentUserId).map((m) => m.id);
      if (unreadIncoming.length > 0) {
        await Promise.all(unreadIncoming.map((id) => axios.post(`${API_BASE_URL}/api/messages/${id}/read`)));
      }
      await loadUnread();
      await Promise.all([loadFolder("inbox"), loadFolder("sent")]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!convMap || Object.keys(convMap).length === 0) return;
    setMessagesInbox((prev) => prev.map((r) => r.conversation_id ? { ...r, toId: convMap[r.conversation_id]?.partner_id ?? r.toId, toName: convMap[r.conversation_id]?.partner_name ?? r.toName } : r));
    setMessagesSent((prev) => prev.map((r) => r.conversation_id ? { ...r, toId: convMap[r.conversation_id]?.partner_id ?? r.toId, toName: convMap[r.conversation_id]?.partner_name ?? r.toName } : r));
    setMessagesHistory((prev) => prev.map((r) => r.conversation_id ? { ...r, toId: convMap[r.conversation_id]?.partner_id ?? r.toId, toName: convMap[r.conversation_id]?.partner_name ?? r.toName } : r));
  }, [convMap]);

  const filteredMessages = (() => {
    const q = searchTerm.trim().toLowerCase();
    const list = msgTab === "inbox" ? messagesInbox : msgTab === "sent" ? messagesSent : messagesHistory;
    if (!q) return list;
    return list.filter((m) =>
      [m.toName, m.text, m.status, m.created_at].some((v) => String(v || "").toLowerCase().includes(q))
    );
  })();

  const filteredConversations = (() => {
    const q = searchTerm.trim().toLowerCase();
    const list = conversations || [];
    if (!q) return list;
    return list.filter((c) => [c.partner_name, c.last_message_preview].some((v) => String(v || "").toLowerCase().includes(q)));
  })();

  const startRange = (currentPage - 1) * entriesPerPage + 1;
  const endRangeMsgs = Math.min(currentPage * entriesPerPage, filteredMessages.length);

  const mapToUiMessages = (list, toId) => {
    return list.map((m) => {
      const created = m.created_at || m.updated_at || m.timestamp || new Date().toISOString();
      const text = m.text || m.activity?.replace(/^Message:\s*/, "") || m.activity || "";
      const isOutgoing = currentUserId && (m.sender_id ? m.sender_id === currentUserId : toId === m.toId);
      return {
        id: m.id || `local-${Date.now()}`,
        text,
        time: new Date(created).toLocaleString(),
        type: isOutgoing ? "outgoing" : "incoming",
      };
    });
  };

  const openMessage = async (row) => {
    const conv = row?.conversation_id ? convMap[row.conversation_id] : null;
    const toId = row?.toId || row?.partner_id || conv?.partner_id || null;
    const toName = row?.toName || row?.partner_name || conv?.partner_name || "User";
    const partner = users.find((u) => u.id === toId);
    setChatWith({ ...row, toId, toName, pic: { name: partner?.name || toName, email: partner?.email || "" } });
    setShowMessageModal(true);
    if (!toId) {
      setMessages([]);
      return;
    }
    setIsLoadingMessages(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/conversations/${toId}/messages`, { params: { page: 1, per_page: 50 } });
      const list = res.data?.data || [];
      const mapped = mapToUiMessages(list, toId);
      setMessages(mapped);
      chatMessagesRef.current = mapped;
      const unreadIncoming = list.filter((m) => m.status !== "read" && m.sender_id && currentUserId && m.sender_id !== currentUserId).map((m) => m.id);
      if (unreadIncoming.length > 0) {
        await Promise.all(unreadIncoming.map((id) => axios.post(`${API_BASE_URL}/api/messages/${id}/read`)));
        await loadUnread();
      }
    } catch (e) {
      console.error(e);
      setMessages([]);
      chatMessagesRef.current = [];
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSubmitMessage = async () => {
    if (!messageTo || !messageText.trim()) return;
    setSending(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/messages`, { to_id: messageTo, text: messageText.trim() });
      const m = res.data?.data;
      if (m) {
        const row = mapMsgRow(m);
        setMessagesSent((prev) => [row, ...prev]);
        await loadFolder("sent");
        await loadUnread();
      }
      setShowAddMessage(false);
      setMessageText("");
      setMessageTo(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const startUpdatesPolling = () => {
    if (updatesTimerRef.current) return;
    updatesTimerRef.current = setInterval(async () => {
      try {
        const params = { updated_after: updatesCursorRef.current || new Date().toISOString(), limit: 100 };
        const res = await axios.get(`${API_BASE_URL}/api/messages/updates`, { params });
        const list = res.data?.data || [];
        const cursor = res.data?.cursor?.updated_after || params.updated_after;
        updatesCursorRef.current = cursor;
        if (!Array.isArray(list) || list.length === 0) return;
        await loadUnread();
        const byId = new Set();
        list.forEach((m) => byId.add(m.id));
        const mappedRows = list.map(mapMsgRow);
        const inboxAdd = mappedRows.filter((r, i) => list[i].sender_id && currentUserId && list[i].sender_id !== currentUserId);
        const sentAdd = mappedRows.filter((r, i) => list[i].sender_id && currentUserId && list[i].sender_id === currentUserId);
        if (inboxAdd.length) setMessagesInbox((prev) => {
          const exist = new Set(prev.map((p) => p.id));
          const merged = [...inboxAdd.filter((r) => !exist.has(r.id)), ...prev.map((p) => (byId.has(p.id) ? mappedRows.find((mr) => mr.id === p.id) || p : p))];
          return merged;
        });
        if (sentAdd.length) setMessagesSent((prev) => {
          const exist = new Set(prev.map((p) => p.id));
          const merged = [...sentAdd.filter((r) => !exist.has(r.id)), ...prev.map((p) => (byId.has(p.id) ? mappedRows.find((mr) => mr.id === p.id) || p : p))];
          return merged;
        });
        setMessagesHistory((prev) => {
          const exist = new Set(prev.map((p) => p.id));
          const merged = [...mappedRows.filter((r) => !exist.has(r.id)), ...prev.map((p) => (byId.has(p.id) ? mappedRows.find((mr) => mr.id === p.id) || p : p))];
          return merged;
        });
      } catch (e) {
        console.error(e);
      }
    }, 5000);
  };

  useEffect(() => {
    if (notifTab !== "messages") return () => {};
    startUpdatesPolling();
    return () => {
      if (updatesTimerRef.current) {
        clearInterval(updatesTimerRef.current);
        updatesTimerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifTab, API_BASE_URL, currentUserId]);

  const renderHeader = () => (
    <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
      <div className="d-flex align-items-center" style={{ maxWidth: 420, flexGrow: 1 }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="d-flex align-items-center gap-2">
        <button className={`btn ${msgTab === "inbox" ? "btn-outline-secondary" : "btn-light"}`} onClick={() => setMsgTab("inbox")}>Inbox</button>
        <button className={`btn ${msgTab === "sent" ? "btn-outline-secondary" : "btn-light"}`} onClick={() => setMsgTab("sent")}>Sent</button>
        <button className={`btn ${msgTab === "history" ? "btn-outline-secondary" : "btn-light"}`} onClick={() => setMsgTab("history")}>History</button>
        <button className="btn btn-danger" onClick={() => setShowAddMessage(true)}>Add Message</button>
      </div>
    </div>
  );

  const renderGeneralHeader = () => (
    <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
      <div className="d-flex align-items-center" style={{ maxWidth: 420, flexGrow: 1 }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="container-fluid bg-white min-vh-100">
      {/* Header: samakan dengan header standar */}
      <header className="dashboard-header">
        <div className="d-flex justify-content-between align-items-center bg-white px-4 py-4">
          {/* Logo */}
          <div className="d-flex align-items-center gap-2">
            <img src="/assets/LogoMinitok.svg" alt="Logo Minitok" className="me-2" style={{ height: "50px" }} />
          </div>

          {/* Menu Buttons */}
          <div className="d-flex align-items-center gap-2">
            {menus.map((menu) => (
              <button
                key={menu}
                onClick={() => handleMenuClick(menu)}
                className={`btn border-white fw-medium d-flex align-items-center ${
                  activeMenu === menu ? "text-danger" : "text-dark"
                }`}
                style={{ backgroundColor: activeMenu === menu ? "#EEF2F6" : "white" }}
              >
                <span>{menu}</span>
                {hasDropdown(menu) && (
                  <img
                    src={activeMenu === menu ? "/assets/CaretDownRedBold.svg" : "/assets/CaretDownBold.svg"}
                    alt="Caret"
                    style={{ width: "20px", height: "20px", marginLeft: "6px" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Notification & Profile */}
          <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                  <div className="position-relative">
                    <button
                      className="btn btn-light p-2 d-flex justify-content-center align-items-center"
                      style={{ backgroundColor: "white", borderColor: "white" }}
                      onClick={() => navigate("/notifications")}
                    >
                      <img src="/assets/Bell.svg" alt="Notifikasi" style={{ width: "24px", height: "24px" }} />
                      {unreadCounts.total_unread > 0 && (
                        <span className="position-absolute translate-middle badge rounded-pill bg-danger" style={{ top: 0, right: 0 }}>
                          {unreadCounts.total_unread}
                        </span>
                      )}
                    </button>
                  </div>
            <div className="position-relative" ref={dropdownContainerRef}>
              <button
                className="btn p-0 border-0"
                aria-haspopup="true"
                aria-expanded={profileMenuOpen ? "true" : "false"}
                onClick={() => setProfileMenuOpen((s) => !s)}
              >
                <img
                  src={currentUser?.profile_picture_url || "/assets/ProfilePicture.svg"}
                  alt="Profile"
                  style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }}
                />
              </button>
              {profileMenuOpen && (
                <div className="profile-menu-panel" style={{ position: "absolute", right: 0, top: "60px" }}>
                  <button className="profile-menu-item" onClick={() => { setProfileMenuOpen(false); navigate("/request-userlist"); }}>
                    <i className="fa-regular fa-user me-2"></i>
                    <span>Account</span>
                  </button>
                  <button className="profile-menu-item" onClick={() => { setProfileMenuOpen(false); logoutNow(); }}>
                    <i className="fa-solid fa-right-from-bracket me-2"></i>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sub Tab untuk Notifications */}
      <div className="dashboard-subtab">
        <div className="px-4 pt-2 mb-1" style={{ backgroundColor: "#EEF2F6" }}>
          <div className="d-flex gap-4">
            <button
              className={`btn border-0 rounded-0 px-0 pb-3 ${notifTab === "general" ? "text-danger border-bottom border-danger border-3" : "text-dark"}`}
              style={{ backgroundColor: "transparent" }}
              onClick={() => setNotifTab("general")}
            >
              General
            </button>
            <button
              className={`btn border-0 rounded-0 px-0 pb-3 ${notifTab === "messages" ? "text-danger border-bottom border-danger border-3" : "text-dark"}`}
              style={{ backgroundColor: "transparent" }}
              onClick={() => setNotifTab("messages")}
            >
              Messages
            </button>
          </div>
        </div>
      </div>

      {/* Konten utama */}
      <main className="dashboard-content">
        <div className="px-4">
        {notifTab === "messages" ? renderHeader() : renderGeneralHeader()}

        {/* Content */}
        {
          <div className="mt-3">
            {notifTab === "messages" ? (
              <div className="table-responsive">
                <table className="table table-custom table-hover align-middle">
                  {msgTab !== "history" ? (
                    <>
                      <thead>
                        <tr>
                          <th style={{ width: 60 }}>Message No</th>
                          <th style={{ width: 220 }}>To</th>
                          <th>Message</th>
                          <th style={{ width: 180 }}>Created Date</th>
                          <th style={{ width: 120 }}>Status</th>
                          {/* <th style={{ width: 80 }}>Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMessages.length === 0 ? (
                          <tr><td colSpan={6} className="text-center">Belum ada data</td></tr>
                        ) : (
                          filteredMessages.map((m, idx) => (
                            <tr key={m.id || idx}>
                              <td>{idx + 1}</td>
                              <td>{m.toName || '-'}</td>
                              <td>{m.text || '-'}</td>
                              <td>{m.created_at ? new Date(m.created_at).toLocaleString() : '-'}</td>
                              <td>{m.status || '-'}</td>
                              {/* <td>
                                <button
                                  className="btn btn-link p-0"
                                  title="Mark Read"
                                  onClick={() => markMessageRead(m)}
                                  aria-label="Mark Read"
                                >
                                  <img src="/assets/TrayArrowUp.svg" alt="Read" style={{ width: 20, height: 20 }} />
                                </button>
                              </td> */}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </>
                  ) : (
                    <>
                      <thead>
                        <tr>
                          <th style={{ width: 60 }}>No</th>
                          <th style={{ width: 220 }}>Partner</th>
                          <th>Preview</th>
                          <th style={{ width: 180 }}>Last Message</th>
                          {/* <th style={{ width: 120 }}>Unread</th> */}
                          {/* <th style={{ width: 80 }}>Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredConversations.length === 0 ? (
                          <tr><td colSpan={6} className="text-center">Belum ada data</td></tr>
                        ) : (
                          filteredConversations.map((c, idx) => (
                            <tr key={c.id || idx}>
                              <td>{idx + 1}</td>
                              <td>{c.partner_name || '-'}</td>
                              <td>{c.last_message_preview || '-'}</td>
                              <td>{c.last_message_at ? new Date(c.last_message_at).toLocaleString() : '-'}</td>
                              {/* <td>{Number(c.unread_count || 0)}</td> */}
                              {/* <td>
                                <button
                                  className="btn btn-link p-0"
                                  title="Mark Read"
                                  onClick={() => markConversationRead(c.partner_id)}
                                  aria-label="Mark Read"
                                >
                                  <img src="/assets/TrayArrowUp.svg" alt="Read" style={{ width: 20, height: 20 }} />
                                </button>
                              </td> */}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-custom table-hover align-middle">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>Message No</th>
                      <th style={{ width: 220 }}>User</th>
                      <th>Message</th>
                      <th style={{ width: 180 }}>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generalLoading ? (
                      <tr><td colSpan={4} className="text-center">Memuat...</td></tr>
                    ) : generalLogs.length === 0 ? (
                      <tr><td colSpan={4} className="text-center">Belum ada data</td></tr>
                    ) : (
                      generalLogs.map((g, idx) => (
                        <tr key={g.id || idx}>
                          <td>{idx + 1}</td>
                          <td>{((g.user && ((g.user.first_name || '') + ' ' + (g.user.last_name || '')).trim()) || (g.user && (g.user.name || g.user.email)) || (userMap[g.user_id]?.name) || (g.user_id ? `User ${g.user_id}` : '-'))}</td>
                          <td>{g.activity || '-'}</td>
                          <td>{g.timestamp ? new Date(g.timestamp).toLocaleString() : (g.created_at ? new Date(g.created_at).toLocaleString() : '-')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Add Message Modal */}
            {showAddMessage && (
              <div className="modal-overlay" onClick={() => setShowAddMessage(false)}>
                <div className="message-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="message-header">
                    <div className="fw-semibold">Add Message</div>
                    <button className="btn btn-sm" onClick={() => setShowAddMessage(false)} aria-label="Close">&times;</button>
                  </div>
                  <div className="p-3">
                    <div className="mb-3">
                      <label className="form-label">To</label>
                      <select
                        className="form-select"
                        value={messageTo ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMessageTo(val === "" ? null : parseInt(val, 10));
                        }}
                      >
                        <option value="" disabled>Pilih user</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Message</label>
                      <textarea className="form-control" rows={6} value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Tulis pesan..." />
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button className="btn btn-outline-secondary" onClick={() => setShowAddMessage(false)}>Cancel</button>
                      <button className="btn btn-danger" disabled={sending || !messageTo || !messageText.trim()} onClick={handleSubmitMessage}>Submit</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            
          </div>
        }
        </div>
      </main>
    </div>
  );
}