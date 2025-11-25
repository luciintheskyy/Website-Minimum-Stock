import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

export default function RekapMinitokONT() {
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const dropdownContainerRef = useRef(null);
  const uploadInputRef = useRef(null);
  const [selectedLevel, setSelectedLevel] = useState("treg"); // treg | witel | ta
  const [selectedWitel, setSelectedWitel] = useState(null);
  const [selectedTreg, setSelectedTreg] = useState(null);
  const [selectedTregs, setSelectedTregs] = useState([
    "TREG 1",
    "TREG 2",
    "TREG 3",
    "TREG 4",
    "TREG 5",
  ]);
  const [tableData, setTableData] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
  const [percentage, setPercentage] = useState(0);
  const [counts, setCounts] = useState({ red: 0, yellow: 0, green: 0 });
  const [reloadToken, setReloadToken] = useState(0);

  const exportXLSX = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reports`, {
        params: { jenis: "ONT", per_page: 200, page: 1 },
      });
      const all = res.data?.data || [];
      const headers = [
        "id",
        "jenis",
        "type",
        "qty",
        "warehouse",
        "sender_alamat",
        "sender_pic",
        "receiver_alamat",
        "receiver_warehouse",
        "receiver_pic",
        "tanggal_pengiriman",
        "tanggal_sampai",
        "batch",
        "created_at",
        "updated_at",
      ];
      const aoa = [headers, ...all.map((r) => headers.map((h) => r[h] ?? ""))];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      XLSX.utils.book_append_sheet(wb, ws, `Report_ONT`);
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_report_ONT.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Gagal export data");
    }
  };

  const openUpload = () => uploadInputRef.current?.click();
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const toStr = (v) => (v == null ? "" : String(v));
      const toDateStr = (v) => {
        if (!v) return "";
        if (v instanceof Date) return v.toISOString().slice(0, 10);
        if (typeof v === "number") {
          const p = XLSX.SSF.parse_date_code(v);
          if (!p) return String(v);
          const yyyy = String(p.y).padStart(4, "0");
          const mm = String(p.m).padStart(2, "0");
          const dd = String(p.d).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        }
        if (typeof v === "string") return v.length >= 10 ? v.slice(0, 10) : v;
        return "";
      };
      const items = rows.map((row) => ({
        type: toStr(row.type),
        qty: parseInt(row.qty || "0", 10),
        warehouse: toStr(row.warehouse),
        sender_alamat: toStr(row.sender_alamat),
        sender_pic: toStr(row.sender_pic),
        receiver_alamat: toStr(row.receiver_alamat),
        receiver_warehouse: toStr(row.receiver_warehouse),
        receiver_pic: toStr(row.receiver_pic),
        tanggal_pengiriman: toDateStr(row.tanggal_pengiriman),
        tanggal_sampai: toDateStr(row.tanggal_sampai),
        batch: toStr(row.batch),
      }));
      const resConfirm = await Swal.fire({ title: "Konfirmasi import", text: `Import ${items.length} item?`, icon: "question", showCancelButton: true, confirmButtonText: "Ya, import", cancelButtonText: "Batal" });
      if (!resConfirm.isConfirmed) return;
      await axios.post(`${API_BASE_URL}/api/reports`, { jenis: "ONT", items });
      toast.success(`Import berhasil: ${items.length} item`);
      setReloadToken((t) => t + 1);
    } catch (err) {
      console.error(err);
      toast.error("Gagal import data");
    } finally {
      e.target.value = "";
    }
  };

  const tregData = {
    "WH TR TREG 1": [
      "WITEL ACEH",
      "WITEL LAMPUNG BENGKULU",
      "WITEL RIAU",
      "WITEL SUMBAGSEL",
      "WITEL SUMBAR JAMBI",
      "WITEL SUMUT",
    ],

    "WH TR TREG 2": [
      "WITEL BANDUNG",
      "WITEL BANTEN",
      "WITEL BEKASI KARAWANG",
      "WITEL JAKARTA CENTRUM",
      "WITEL JAKARTA INNER",
      "WITEL JAKARTA OUTER",
      "WITEL PRIANGAN BARAT",
      "WITEL PRIANGAN TIMUR",
    ],

    "WH TR TREG 3": [
      "WITEL BALI",
      "WITEL JATIM BARAT",
      "WITEL JATIM TIMUR",
      "WITEL NUSA TENGGARA",
      "WITEL SEMARANG JATENG UTARA",
      "WITEL SOLO JATENG TIMUR",
      "WITEL SURAMADU",
      "WITEL YOGYA JATENG SELATAN",
    ],

    "WH TR TREG 4": [
      "WITEL BALIKPAPAN",
      "WITEL KALBAR",
      "WITEL KALSELTENG",
      "WITEL KALTIMTARA",
    ],

    "WH TR TREG 5": [
      "WITEL PAPUA",
      "WITEL PAPUA BARAT",
      "WITEL SULBAGSEL",
      "WITEL SULBAGTENG",
      "WITEL SUMALUT",
    ],
  };

  const witelData = {
    "WITEL ACEH": [
      "TA SO CCAN BANDA ACEH WH",
      "TA SO CCAN LANGSA WH",
      "TA SO CCAN LHOKSEUMAWE WH",
      "TA SO CCAN MEULABOH WH",
      "TA SO CCAN TAKENGON WH",
      "TA SO CCAN TAPAKTUAN WH",
      "TA WITEL CCAN NAD (ACEH) WH",
    ],

    "WITEL LAMPUNG BENGKULU": [
      "TA SO CCAN BENGKULU WH",
      "TA SO CCAN CURUP WH",
      "TA SO CCAN IPUH WH",
      "TA SO CCAN KOTA BUMI WH",
      "TA SO CCAN LAMPUNG WH",
      "TA SO CCAN LIWA WH",
      "TA SO CCAN MANNA WH",
      "TA SO CCAN METRO WH",
      "TA SO CCAN UNIT 2 WH",
      "TA WITEL CCAN BENGKULU (BENGKULU) WH",
      "TA WITEL CCAN LAMPUNG (BANDAR LAMPUNG) WH",
    ],

    "WITEL RIAU": [
      "TA SO CCAN ARENGKA WH",
      "TA SO BATAM CENTRE WH",
      "TA SO CCAN BATAM WH",
      "TA SO CCAN DUMAI WH",
      "TA SO CCAN DURI WH",
      "TA SO CCAN PEKANBARU WH",
      "TA SO CCAN RENGAT WH",
      "TA SO CCAN RUMBAI WH",
      "TA SO CCAN SAGULUNG WH",
      "TA SO CCAN TANJUNG BALAI KARIMUN WH",
      "TA SO CCAN TANJUNG PINANG WH",
      "TA SO CCAN TEMBILAHAN WH",
      "TA SO CCAN UJUNG BATU WH",
      "TA WITEL CCAN RIAU DARATAN (PEKANBARU) WH",
      "TA WITEL CCAN RIAU KEPULAUAN (BATAM) WH",
    ],

    "WITEL SUMBAGSEL": [
      "TA SO CCAN BATURAJA WH",
      "TA SO CCAN KAYUAGUNG WH",
      "TA SO CCAN KENTEN UJUNG WH",
      "TA SO CCAN KOBA WH",
      "TA SO CCAN LAHAT WH",
      "TA SO CCAN LUBUK LINGGAU WH",
      "TA SO CCAN MENTOK WH",
      "TA SO CCAN MUARA ENIM",
      "TA SO CCAN PALEMBANG CENTRUM WH",
      "TA SO CCAN PANGKALPINANG WH",
      "TA SO CCAN PRABUMULIH WH",
      "TA SO CCAN SEBRANG ULU WH",
      "TA SO CCAN SEKAYU WH",
      "TA SO CCAN SUNGAI LIAT WH",
      "TA SO CCAN TALANG KELAPA WH",
      "TA SO CCAN TANJUNG PANDAN WH",
      "TA WITEL CCAN BANGKA BELITUNG (PANGKAL PINANG) WH",
      "TA WITEL CCAN SUMATERA SELATAN (PALEMBANG) WH",
    ],

    "WITEL SUMBAR JAMBI": [
      "TA SO CCAN BUKITTINGGI WH",
      "TA SO CCAN JAMBI WH",
      "TA SO CCAN MUARA BUNGO WH",
      "TA SO CCAN PADANG WH",
      "TA SO CCAN PAYAKUMBUH WH",
      "TA SO CCAN SAROLANGUN WH",
      "TA SO CCAN SOLOK WH",
      "TA SO CCAN ULAKARANG WH",
      "TA WITEL CCAN JAMBI WH",
      "TA WITEL CCAN SUMATERA BARAT (PADANG) WH",
    ],

    "WITEL SUMUT": [
      "TA SO CCAN BINJAI WH",
      "TA SO CCAN CINTA DAMAI WH",
      "TA SO CCAN KABANJAHE WH",
      "TA SO CCAN KISARAN WH",
      "TA SO CCAN LUBUK PAKAM WH",
      "TA SO CCAN MEDAN CENTRUM WH",
      "TA SO CCAN PADANG BULAN WH",
      "TA SO CCAN PADANG SIDEMPUAN WH",
      "TA SO CCAN PEMATANGSIANTAR WH",
      "TA SO CCAN PULO BRAYAN WH",
      "TA SO CCAN RANTAU PRAPAT WH",
      "TA SO CCAN SIBOLGA WH",
      "TA SO CCAN SIMPANG LIMUN WH",
      "TA SO CCAN SUKA RAMAI WH",
      "TA SO CCAN TANJUNG MORAWA WH",
      "TA SO CCAN TANJUNG MULIA WH",
      "TA WITEL CCAN SUMUT BARAT (MEDAN) WH",
      "TA WITEL CCAN SUMUT TIMUR (PEMATANG SIANTAR) WH",
    ],

    "WITEL BANDUNG": [
      "TA SO CCAN AHMAD YANI WH",
      "TA SO CCAN BANDUNG CENTRUM WH",
      "TA SO CCAN BANJARAN",
      "TA SO CCAN CIJAURA WH",
      "TA SO CCAN CIMAHI WH",
      "TA SO CCAN GEGERKALONG WH",
      "TA SO CCAN KOPO WH",
      "TA SO CCAN LEMBANG WH",
      "TA SO CCAN MAJALAYA WH",
      "TA SO CCAN PADALARANG WH",
      "TA SO CCAN RAJAWALI WH",
      "TA SO CCAN SUMEDANG WH",
      "TA SO CCAN UJUNG BERUNG WH",
      "TA WITEL CCAN BANDUNG BARAT WH",
      "TA WITEL CCAN JABAR TENGAH (BANDUNG) WH",
    ],

    "WITEL BANTEN": [
      "TA SO CCAN CIKUPA WH",
      "TA SO CCAN CILEDUG WH",
      "TA SO CCAN CILEGON WH",
      "TA SO CCAN CIPONDOH WH",
      "TA SO CCAN CIPUTAT WH",
      "TA SO CCAN GANDASARI WH",
      "TA SO CCAN LEGOK WH",
      "TA SO CCAN LENGKONG WH",
      "TA SO CCAN MALIMPING WH",
      "TA SO CCAN MENES WH",
      "TA SO CCAN PAKULONAN",
      "TA SO CCAN PANDEGLANG WH",
      "TA SO CCAN PASAR KEMIS WH",
      "TA SO CCAN PONDOK AREN WH",
      "TA SO CCAN RANGKASBITUNG WH",
      "TA SO CCAN SERANG WH",
      "TA SO CCAN SERPONG WH",
      "TA SO CCAN TANGERANG WH",
      "TA WITEL CCAN BANTEN BARAT (SERANG) WH",
      "TA WITEL CCAN BANTEN TIMUR (TANGERANG) WH",
    ],

    "WITEL BEKASI KARAWANG": [
      "TA SO CCAN BANTAR GEBANG WH",
      "TA SO CCAN BEKASI JUANDA WH",
      "TA SO CCAN CIBITUNG WH",
      "TA SO CCAN CIKAMPEK WH",
      "TA SO CCAN CIKARANG WH",
      "TA SO CCAN JABABEKA WH",
      "TA SO CCAN KALIABANG WH",
      "TA SO CCAN KARAWANG WH",
      "TA SO CCAN KLARI WH",
      "TA SO CCAN KRANJI WH",
      "TA SO CCAN PAMANUKAN WH",
      "TA SO CCAN PEKAYON WH",
      "TA SO CCAN PONDOK GEDE WH",
      "TA SO CCAN PURWAKARTA WH",
      "TA SO CCAN RENGASDENGKLOK WH",
      "TA SO CCAN SUBANG WH",
      "TA SO CCAN SUKARESMI WH",
      "TA SO CCAN TELUK JAMBE WH",
      "TA WITEL CCAN JABAR BARAT UTARA (BEKASI) WH",
      "TA WITEL CCAN JABAR UTARA (KARAWANG) WH",
    ],

    "WITEL JAKARTA CENTRUM": [
      "TA SO CCAN CEMPAKA PUTIH WH",
      "TA SO CCAN CIDENG WH",
      "TA SO CCAN CIKINI WH",
      "TA SO CCAN CILINCING WH",
      "TA SO CCAN GAMBIR WH",
      "TA SO CCAN KELAPA GADING WH",
      "TA SO CCAN KEMAYORAN WH",
      "TA SO CCAN KOTA WH",
      "TA SO CCAN MANGGA BESAR WH",
      "TA SO CCAN MUARA KARANG WH",
      "TA SO CCAN PADEMANGAN WH",
      "TA SO CCAN SUNTER WH",
      "TA SO CCAN TANJUNG PRIOK WH",
      "TA WITEL CCAN JAKARTA PUSAT WH",
      "TA WITEL CCAN JAKARTA UTARA WH",
    ],

    "WITEL JAKARTA INNER": [
      "TA SO CCAN CENGKARENG A WH",
      "TA SO CCAN CENGKARENG B WH",
      "TA SO CCAN KEDOYA WH",
      "TA SO CCAN MERUYA WH",
      "TA SO CCAN PALMERAH WH",
      "TA SO CCAN SEMANGGI WH",
      "TA SO CCAN SLIPI WH",
      "TA WITEL CCAN JAKARTA BARAT WH",
    ],

    "WITEL JAKARTA OUTER": [
      "TA SO CCAN BINTARO WH",
      "TA SO CCAN CAWANG WH",
      "TA SO CCAN CIPETE WH",
      "TA SO CCAN GANDARIA WH",
      "TA SO CCAN JAGAKARSA WH",
      "TA SO CCAN JATINEGARA WH",
      "TA SO CCAN KALIBATA WH",
      "TA SO CCAN KEBAYORAN BARU WH",
      "TA SO CCAN KEMANG WH",
      "TA SO CCAN KLENDER WH",
      "TA SO CCAN KRANGGAN WH",
      "TA SO CCAN PASAR MINGGU WH",
      "TA SO CCAN PASAR REBO WH",
      "TA SO CCAN PENGGILINGAN WH",
      "TA SO CCAN PONDOK KELAPA WH",
      "TA SO CCAN PULO GEBANG WH",
      "TA SO CCAN RAWAMANGUN WH",
      "TA SO CCAN TEBET WH",
      "TA WITEL CCAN JAKARTA SELATAN WH",
      "TA WITEL CCAN JAKARTA TIMUR WH",
    ],

    "WITEL PRIANGAN BARAT": [
      "TA SO CCAN BOGOR CENTRUM WH",
      "TA SO CCAN CIANJUR WH",
      "TA SO CCAN CIAWI WH",
      "TA SO CCAN CIBADAK WH",
      "TA SO CCAN CIBINONG WH",
      "TA SO CCAN CILEUNGSI WH",
      "TA SO CCAN CISARUA WH",
      "TA SO CCAN DEPOK WH",
      "TA SO CCAN DRAMAGA WH",
      "TA SO CCAN GUNUNG PUTRI WH",
      "TA SO CCAN KEDUNG HALANG WH",
      "TA SO CCAN PELABUHAN RATU WH",
      "TA SO CCAN SEMPLAK WH",
      "TA SO CCAN SINDANGLAYA WH",
      "TA SO CCAN SUKABUMI WH",
      "TA SO CCAN SUKMAJAYA WH",
      "TA WITEL CCAN JABAR BARAT (BOGOR) WH",
      "TA WITEL CCAN JABAR SELATAN (SUKABUMI) WH",
    ],

    "WITEL PRIANGAN TIMUR": [
      "TA SO CCAN BANJAR WH",
      "TA SO CCAN CIAMIS WH",
      "TA SO CCAN CIREBON WH",
      "TA SO CCAN GARUT WH",
      "TA SO CCAN HAURGEULIS WH",
      "TA SO CCAN INDRAMAYU WH",
      "TA SO CCAN KADIPATEN WH",
      "TA SO CCAN KARANGNUNGGAL WH",
      "TA SO CCAN KARYAMULYA WH",
      "TA SO CCAN KUNINGAN WH",
      "TA SO CCAN MAJALENGKA WH",
      "TA SO CCAN PAMENGPEUK WH",
      "TA SO CCAN PANGANDARAN WH",
      "TA SO CCAN PLERED WH",
      "TA SO CCAN SINDANG LAUT WH",
      "TA SO CCAN SINGAPARNA WH",
      "TA SO CCAN TASIKMALAYA WH",
      "TA WITEL CCAN JABAR TIMSEL (TASIKMALAYA) WH",
      "TA WITEL CCAN JABAR TIMUR (CIREBON) WH",
    ],

    "WITEL BALI": [
      "TA SO CCAN GIANYAR WH",
      "TA SO CCAN JIMBARAN WH",
      "TA SO CCAN KALIASEM WH",
      "TA SO CCAN SANUR WH",
      "TA SO CCAN SEMARAPURA WH",
      "TA SO CCAN SINGARAJA WH",
      "TA SO CCAN TABANAN WH",
      "TA SO CCAN TOHPATI WH",
      "TA SO CCAN UBUNG WH",
      "TA WITEL CCAN BALI SELATAN (DENPASAR) WH",
      "TA WITEL CCAN BALI UTARA (SINGARAJA) WH",
    ],

    "WITEL JATIM BARAT": [
      "TA SO CCAN BLIMBING WH",
      "TA SO CCAN BLITAR WH",
      "TA SO CCAN BOJONEGORO WH",
      "TA SO CCAN KARANG PLOSO WH",
      "TA SO CCAN KEDIRI WH",
      "TA SO CCAN KEPANJEN WH",
      "TA SO CCAN KERTOSONO WH",
      "TA SO CCAN KLOJEN WH",
      "TA SO CCAN MADIUN WH",
      "TA SO CCAN MAGETAN WH",
      "TA SO CCAN MALANG KOTA WH",
      "TA SO CCAN MOJOROTO WH",
      "TA SO CCAN NGANJUK WH",
      "TA SO CCAN NGAWI WH",
      "TA SO CCAN PACITAN WH",
      "TA SO CCAN PARE (KEDIRI) WH",
      "TA SO CCAN PONOROGO WH",
      "TA SO CCAN SAWOJAJAR WH",
      "TA SO CCAN SINGOSARI WH",
      "TA SO CCAN TRENGGALEK WH",
      "TA SO CCAN TUBAN WH",
      "TA SO CCAN TULUNGAGUNG WH",
      "TA SO CCAN TUREN WH",
      "TA SO CCAN WALINGI WH",
      "TA WITEL CCAN JATIM SELATAN (MALANG) WH",
      "TA WITEL CCAN JATIM TENGAH (KEDIRI) WH",
      "TA WITEL CCAN MADIUN WH",
    ],

    "WITEL JATIM TIMUR": [
      "TA SO CCAN BANYUWANGI WH",
      "TA SO CCAN BONDOWOSO WH",
      "TA SO CCAN GENTENG WH",
      "TA SO CCAN JEMBER KOTA WH",
      "TA SO CCAN JEMBER WH",
      "TA SO CCAN JENGGAWAH WH",
      "TA SO CCAN JOMBANG WH",
      "TA SO CCAN KALISAT WH",
      "TA SO CCAN KRIAN WH",
      "TA SO CCAN LUMAJANG WH",
      "TA SO CCAN MOJOKERTO WH",
      "TA SO CCAN PANDAAN WH",
      "TA SO CCAN PASURUAN WH",
      "TA SO CCAN PROBOLINGGO WH",
      "TA SO CCAN SIDOARJO WH",
      "TA SO CCAN SITUBONDO WH",
      "TA SO CCAN TANGGUL WH",
      "TA SO CCAN TANGGULANGIN WH",
      "TA WITEL CCAN JATIM SELATAN TIMUR (PASURUAN) WH",
      "TA WITEL CCAN JATIM TENGAH TIMUR (SIDOARJO) WH",
      "TA WITEL CCAN JATIM TIMUR (JEMBER) WH",
    ],

    "WITEL NUSA TENGGARA": [
      "TA SO CCAN ATAMBUA WH",
      "TA SO CCAN BIMA WH",
      "TA SO CCAN DOMPU WH",
      "TA SO CCAN ENDE WH",
      "TA SO CCAN KUPANG WH",
      "TA SO CCAN LABUAN BAJO WH",
      "TA SO CCAN MATARAH",
      "TA SO CCAN MATARAM WH",
      "TA SO CCAN MAUMERE WH",
      "TA SO CCAN PRAYA WH",
      "TA SO CCAN SELONG WH",
      "TA SO CCAN SUMBAWA WH",
      "TA SO CCAN TALIWANG WH",
      "TA SO CCAN WAINGAPU WH",
      "TA WITEL CCAN NTB (MATARAM) WH",
      "TA WITEL CCAN NTT (KUPANG) WH",
    ],

    "WITEL SEMARANG JATENG UTARA": [
      "TA SO CCAN BANYUMANIK WH",
      "TA SO CCAN BATANG WH",
      "TA SO CCAN BREBES WH",
      "TA SO CCAN CANDI WH",
      "TA SO CCAN JOHAR WH",
      "TA SO CCAN KENDAL WH",
      "TA SO CCAN MAJAPAHIT WH",
      "TA SO CCAN PEKALONGAN WH",
      "TA SO CCAN PEMALANG WH",
      "TA SO CCAN SALATIGA WH",
      "TA SO CCAN SIMPANG LIMA WH",
      "TA SO CCAN SLAWI WH",
      "TA SO CCAN TEGAL WH",
      "TA SO CCAN TUGU WH",
      "TA SO CCAN UNGARAN WH",
      "TA WITEL CCAN JATENG BARAT UTARA (PEKALONGAN) WH",
      "TA WITEL CCAN JATENG UTARA (SEMARANG) WH",
    ],

    "WITEL SOLO JATENG TIMUR": [
      "TA SO CCAN BLORA WH",
      "TA SO CCAN BOYOLALI WH",
      "TA SO CCAN DEMAK WH",
      "TA SO CCAN GLADAG WH",
      "TA SO CCAN GROGOL WH",
      "TA SO CCAN JEPARA WH",
      "TA SO CCAN KARANGANYAR WH",
      "TA SO CCAN KARTOSURO WH",
      "TA SO CCAN KERTEN WH",
      "TA SO CCAN KLATEN WH",
      "TA SO CCAN KUDUS WH",
      "TA SO CCAN PALUR WH",
      "TA SO CCAN PATI WH",
      "TA SO CCAN PURWODADI WH",
      "TA SO CCAN REMBANG WH",
      "TA SO CCAN SRAGEN WH",
      "TA SO CCAN SUKOHARJO WH",
      "TA SO CCAN WONOGIRI WH",
      "TA WITEL CCAN JATENG TIMUR SELATAN (SOLO) WH",
      "TA WITEL CCAN JATENG TIMUR UTARA (KUDUS) WH",
    ],

    "WITEL SURAMADU": [
      "TA SO CCAN BAMBE WH",
      "TA SO CCAN BANGKALAN WH",
      "TA SO CCAN DARMO WH",
      "TA SO CCAN GRESIK WH",
      "TA SO CCAN GUBENG WH",
      "TA SO CCAN INJOKO WH",
      "TA SO CCAN JAGIR WH",
      "TA SO CCAN KALIANAK WH",
      "TA SO CCAN KANDANGAN WH",
      "TA SO CCAN KAPASAN WH",
      "TA SO CCAN KARANG PILANG WH",
      "TA SO CCAN KEBALEN WH",
      "TA SO CCAN KENJERAN WH",
      "TA SO CCAN LAKARSANTRI WH",
      "TA SO CCAN LAMONGAN WH",
      "TA SO CCAN MANYAR WH",
      "TA SO CCAN MERGOYOSO WH",
      "TA SO CCAN PAMEKASAN WH",
      "TA SO CCAN RUNGKUT WH",
      "TA SO CCAN SAMPANG WH",
      "TA SO CCAN SUMENEP WH",
      "TA SO CCAN TANDES WH",
      "TA SO CCAN WARU1 WH",
      "TA SO CCAN WARU2 WH",
      "TA WITEL CCAN JATIM SURABAYA SELATAN",
      "TA WITEL CCAN MADURA WH",
      "TA WITEL CCAN SURABAYA UTARA WH",
    ],

    "WITEL YOGYA JATENG SELATAN": [
      "TA SO CCAN BANJARNEGARA WH",
      "TA SO CCAN BANTUL WH",
      "TA SO CCAN CILACAP WH",
      "TA SO CCAN KALASAN WH",
      "TA SO CCAN KEBUMEN WH",
      "TA SO CCAN KENTUNGAN WH",
      "TA SO CCAN KOTABARU WH",
      "TA SO CCAN KROYA WH",
      "TA SO CCAN MAGELANG WH",
      "TA SO CCAN MAJENANG WH",
      "TA SO CCAN MUNGKID WH",
      "TA SO CCAN PUGERAN WH",
      "TA SO CCAN PURBALINGGA WH",
      "TA SO CCAN PURWOKERTO WH",
      "TA SO CCAN PURWOREJO WH",
      "TA SO CCAN SLEMAN WH",
      "TA SO CCAN TEMANGGUNG WH",
      "TA SO CCAN WONOSARI WH",
      "TA SO CCAN WONOSOBO WH",
      "TA WITEL CCAN DI YOGYAKARTA WH",
      "TA WITEL CCAN JATENG BARAT SELATAN (PURWOKERTO) WH",
      "TA WITEL CCAN JATENG SELATAN (MAGELANG) WH",
    ],

    "WITEL BALIKPAPAN": [
      "TA SO CCAN BALIKPAPAN 2 WH",
      "TA SO CCAN BALIKPAPAN BARU WH",
      "TA SO CCAN KS TUBUN WH",
      "TA SO CCAN LONGIKIS WH",
      "TA SO CCAN MANGGAR WH",
      "TA SO CCAN MUARA JAWA WH",
      "TA SO CCAN PENAJAM PASER UTARA WH",
      "TA SO CCAN TANAH GEROGOT WH",
      "TA WITEL CCAN BALIKPAPAN WH",
    ],

    "WITEL KALBAR": [
      "TA SO CCAN KETAPANG WH",
      "TA SO CCAN MEMPAWAH WH",
      "TA SO CCAN NGABANG WH",
      "TA SO CCAN PONTIANAK 1 WH",
      "TA SO CCAN PONTIANAK 2 WH",
      "TA SO CCAN PUTUS SIBAU WH",
      "TA SO CCAN SAMBAS WH",
      "TA SO CCAN SANGGAU WH",
      "TA SO CCAN SIANTAN WH",
      "TA SO CCAN SINGKAWANG WH",
      "TA SO CCAN SINTANG WH",
      "TA WITEL CCAN KALBAR (PONTIANAK) WH",
    ],

    "WITEL KALSELTENG": [
      "TA SO CCAN AMUNTAI WH",
      "TA SO CCAN BANJARBARU WH",
      "TA SO CCAN BANJARMASIN 1 WH",
      "TA SO CCAN BANJARMASIN 2 WH",
      "TA SO CCAN BARABAI WH",
      "TA SO CCAN BATULICIN WH",
      "TA SO CCAN BUNTOK WH",
      "TA SO CCAN KANDANGAN(REG6)",
      "TA SO CCAN KOTABARU (BANJARMASIN) WH",
      "TA SO CCAN KUALA KAPUAS WH",
      "TA SO CCAN KUALA KURUN WH",
      "TA SO CCAN KUALA PEMBUANG WH",
      "TA SO CCAN LAMANDAU WH",
      "TA SO CCAN MUARA TEWEH WH",
      "TA SO CCAN PALANGKARAYA 1 WH",
      "TA SO CCAN PALANGKARAYA 2 WH",
      "TA SO CCAN PANGKALANBUN WH",
      "TA SO CCAN PELAIHARI WH",
      "TA SO CCAN PURUK CAHU WH",
      "TA SO CCAN RANTAU WH",
      "TA SO CCAN SAMPIT WH",
      "TA SO CCAN SATUI WH",
      "TA SO CCAN TAMIYANG LAYANG WH",
      "TA SO CCAN TANJUNG WH",
      "TA WITEL CCAN KALSEL (BANJARMASIN) WH",
      "TA WITEL CCAN KALTENG (PALANGKARAYA) WH",
      "WH SO CCAN TANJUNG TABALONG",
    ],

    "WITEL KALTIMTARA": [
      "TA SO CCAN BERAU WH",
      "TA SO CCAN BONTANG WH",
      "TA SO CCAN MALINAU WH",
      "TA SO CCAN MELAK WH",
      "TA SO CCAN NUNUKAN WH",
      "TA SO CCAN SAMARINDA 1 WH",
      "TA SO CCAN SAMARINDA 2 WH",
      "TA SO CCAN SANGATA WH",
      "TA SO CCAN SEBATIK WH",
      "TA SO CCAN TANJUNG SELOR WH",
      "TA SO CCAN TARAKAN 1 WH",
      "TA SO CCAN TARAKAN 2 WH",
      "TA SO CCAN TENGGARONG WH",
      "TA SO CCAN WAHAU WH",
      "TA WITEL CCAN KALTIMTENG (SAMARINDA) WH",
      "TA WITEL CCAN KALTIMUT (TARAKAN) WH",
    ],

    "WITEL PAPUA": [
      "TA SO CCAN ABEPURA WH",
      "TA SO CCAN JAYAPURA WH",
      "TA SO CCAN MERAUKE WH",
      "TA SO CCAN SENTANI WH",
      "TA SO CCAN TIMIKA WH",
      "TA WITEL CCAN PAPUA (JAYAPURA) WH",
    ],

    "WITEL PAPUA BARAT": [
      "TA SO CCAN BIAK WH",
      "TA SO CCAN FAK FAK WH",
      "TA SO CCAN KAIMANA WH",
      "TA SO CCAN MANOKWARI WH",
      "TA SO CCAN NABIRE",
      "TA SO CCAN SORONG WH",
      "TA WITEL CCAN PAPUA BARAT (SORONG) WH",
    ],

    "WITEL SULBAGSEL": [
      "TA SO CCAN BALAIKOTA WH",
      "TA SO CCAN BANTAENG",
      "TA SO CCAN BANTAENG WH",
      "TA SO CCAN BAUBAU WH",
      "TA SO CCAN BONE WH",
      "TA SO CCAN BULUKUMBA WH",
      "TA SO CCAN KENDARI WH",
      "TA SO CCAN KOLAKA WH",
      "TA SO CCAN MAMUJU WH",
      "TA SO CCAN MAROS WH",
      "TA SO CCAN MASAMBA WH",
      "TA SO CCAN MATTOANGIN 2 WH",
      "TA SO CCAN PALOPO WH",
      "TA SO CCAN PANAKUKANG WH",
      "TA SO CCAN PAREPARE WH",
      "TA SO CCAN RANTEPAO WH",
      "TA SO CCAN SENGKANG WH",
      "TA SO CCAN SUDIANG WH",
      "TA SO CCAN SUNGGUMINASA WH",
      "TA SO CCAN TAMALANREA WH",
      "TA SO CCAN WONOMULYO WH",
      "TA WITEL CCAN SULSE BARAT (PARE-PARE) WH",
      "TA WITEL CCAN SULSEL (MAKASSAR) WH",
      "TA WITEL CCAN SULTRA (KENDARI) WH",
    ],

    "WITEL SULBAGTENG": [
      "TA SO CCAN GORONTALO WH",
      "TA SO CCAN LIMBOTO WH",
      "TA SO CCAN LUWUK WH",
      "TA SO CCAN MARISA WH",
      "TA SO CCAN PALU WH",
      "TA SO CCAN POSO WH",
      "TA SO CCAN TOLI-TOLI WH",
      "TA WITEL CCAN SULTENG (PALU) WH",
      "TA WITEL CCAN SULUT (GORONTALO) WH",
    ],

    "WITEL SUMALUT": [
      "TA SO CCAN AMBON WH",
      "TA SO CCAN BITUNG WH",
      "TA SO CCAN HALMAHERA UTARA WH",
      "TA SO CCAN KOTAMOBAGU WH",
      "TA SO CCAN MANADO WH",
      "TA SO CCAN MASOHI WH",
      "TA SO CCAN MINAHASA WH",
      "TA SO CCAN NAMLEA WH",
      "TA SO CCAN TERNATE WH",
      "TA SO CCAN TUAL WH",
      "TA WITEL CCAN MALUKU (AMBON) WH",
      "TA WITEL CCAN SULUT (MANADO) WH",
    ],
  };

  const currentTableRows = useMemo(() => {
    let warehouses = [];
    if (selectedLevel === "treg") {
      // Multi-select TREG (dari selectedTregs)
      if (selectedTregs && selectedTregs.length > 0) {
        warehouses = selectedTregs
          .map((treg) => `WH TR TREG ${treg.replace("TREG ", "")}`) // Generate key dari checked
          .filter((tregKey) => tregData.hasOwnProperty(tregKey)); // Hanya yang valid di tregData
      } else {
        warehouses = []; // Atau default Object.keys(tregData) jika ingin tampil semua
      }
    } else if (selectedLevel === "witel" && selectedTreg) {
      // FIX: Gunakan selectedTreg (TREG parent) untuk tampil WITEL di bawah TREG
      warehouses = tregData[selectedTreg] || [];
    } else if (selectedLevel === "ta" && selectedWitel) {
      // Gunakan selectedWitel (WITEL parent) untuk tampil TA di bawah WITEL
      warehouses = witelData[selectedWitel] || [];
    }

    return warehouses.map((wh) => {
      const rowData = tableData.find((data) => data.warehouse === wh);
      return (
        rowData || {
          warehouse: wh,
          totalRetailSB: 0,
          totalRetailDB: 0,
          totalPremiumSCMT: 0,
          totalONTSCMT: 0,
          totalPremiumGAP: 0,
          totalONTGAP: 0,
          totalRetailKebutuhan: 0,
          totalPremiumKebutuhan: 0,
          totalONTKebutuhan: 0,
          totalRetailMinStock: 0,
          totalPremiumMinStock: 0,
          totalONTMinStock: 0,
          totalRetailDelivery: 0,
          totalPremiumDelivery: 0,
        }
      );
    });
  }, [tableData, selectedLevel, selectedTreg, selectedWitel, selectedTregs]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/reports/summary`, {
          params: { jenis: "ONT", yellow_threshold: 20 },
        });
        const data = res.data || {};
        const lu = data.last_update || null;
        if (lu) {
          const date = new Date(lu);
          const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
          setLastUpdate(formattedDate);
        }
        setPercentage(Number(data.percentage || 0));
        setCounts({
          red: Number(data.counts?.red || 0),
          yellow: Number(data.counts?.yellow || 0),
          green: Number(data.counts?.green || 0),
        });
      } catch (e) {
        // Silent fail; biarkan tabel lokal tetap tampil
        console.error(e);
      }
    };
    fetchSummary();
  }, [API_BASE_URL, reloadToken]);

  useEffect(() => {
    const allWarehouses = [
      ...Object.keys(tregData),
      ...Object.values(tregData).flat(),
      ...Object.values(witelData).flat(),
    ].filter((wh, index, self) => self.indexOf(wh) === index);

    const generatedData = allWarehouses.map((wh, i) => {
      // Nilai statis fixed berdasarkan index (i) - berbeda per warehouse, tapi tetap selamanya
      const baseValue = i * 10; // Misal: Warehouse 0 = base 0, Warehouse 1 = base 10, dst.
      return {
        warehouse: wh,
        totalRetailSB: 50 + baseValue,
        totalRetailDB: 60 + baseValue,
        totalPremiumSCMT: 20 + baseValue / 2,
        totalONTSCMT: 80 + baseValue,
        totalPremiumGAP: 5 + baseValue / 5,
        totalONTGAP: 10 + baseValue / 2,
        totalRetailKebutuhan: 200 + baseValue * 2,
        totalPremiumKebutuhan: 100 + baseValue,
        totalONTKebutuhan: 300 + baseValue * 2,
        totalRetailMinStock: 100 + baseValue,
        totalPremiumMinStock: 50 + baseValue / 2,
        totalONTMinStock: 150 + baseValue,
        totalRetailDelivery: 50 + baseValue,
        totalPremiumDelivery: 50 + baseValue,
      };
    });

    setTableData(generatedData);
  }, []);

  const toggleDropdown = (type) => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  const handleTregCheckboxToggle = (tregOption) => {
    setSelectedTregs((prev) => {
      const isSelected = prev.includes(tregOption);
      let newSelected;
      if (isSelected) {
        newSelected = prev.filter((item) => item !== tregOption); // Uncheck
      } else {
        newSelected = [...prev, tregOption]; // Check
      }
      // Sort urutan TREG terkecil ke terbesar (1,2,3,4,5) - tetap jalan
      newSelected.sort(
        (a, b) =>
          parseInt(a.replace("TREG ", "")) - parseInt(b.replace("TREG ", ""))
      );
      return newSelected; // Biarkan [] jika kosong (no data di tabel)
    });
    // HAPUS: setActiveDropdown(null); // Dropdown TREG TETAP BUKA untuk multi-toggle
    // Opsional: Tambah console.log untuk test
    console.log("TREG toggled:", tregOption, "Dropdown remains open");
  };

  const handleOptionSelect = (option, type, e) => {
    if (e) e.stopPropagation(); // Hindari bubble ke tabel
    console.log("Selected:", option);
    if (type === "treg") {
      setSelectedTreg(option); // Single untuk drill-down
      setSelectedLevel("treg");
      setSelectedWitel(null);
    }
    if (type === "export" || (option && option.toLowerCase().includes("export"))) {
      exportXLSX();
    } else if (type === "upload" || (option && option.toLowerCase().includes("upload"))) {
      openUpload();
    }
    // Untuk TA CCAN/Export/Upload (tanpa type): Hanya console.log, tidak ubah warehouses/tabel
    setActiveDropdown(null); // Tutup dropdown - re-render tapi nomor tetap fixed
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target) &&
        !event.target.closest(".dropdown-item") &&
        !event.target.closest(".table") &&
        !event.target.closest(".btn")
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (currentTableRows.length === 0 && tableData.length > 0) {
      // Reset state ke level awal (treg) untuk munculkan WH TR TREG 1-5
      setSelectedLevel("treg");
      setSelectedWitel(null); // Reset witel selection
      setSelectedTreg(null); // FIX: Reset TREG parent (sesuai instruksi)
      // Jika ada state selectedTa, tambah: setSelectedTa(null);
      // Opsional: console.log untuk test
      console.log(
        "No data detected - Reset to initial TREG level (WH TR TREG 1-5)"
      );
    }
  }, [
    currentTableRows.length,
    tableData.length,
    selectedTregs.length,
    selectedLevel,
  ]);

  return (
    <>
      {/* Cards */}
      <div className="row g-3 py-3 mb-1">
        {/* Percentage */}
        <div className="col-md-3">
          <div className="border rounded bg-white px-3 py-3">
            <div className="text-muted medium mb-1">Percentage</div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="h3 mb-0">{Number(percentage).toFixed(2)}%</div>
              <img
                src="/assets/ChartBar.svg"
                alt="Chart"
                style={{ width: "32px", height: "32px" }}
              />
  </div>
  <input ref={uploadInputRef} type="file" accept=".xlsx" style={{ display: "none" }} onChange={handleFileSelected} />
          </div>
        </div>
        {/* Red Status */}
        <div className="col-md-3">
          <div className="border rounded bg-white px-3 py-3">
            <div className="text-muted medium mb-1">Red Status</div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="h3 mb-0">{counts.red}</div>
              <img
                src="/assets/CautionBell.svg"
                alt="Chart"
                style={{ width: "32px", height: "32px" }}
              />
            </div>
          </div>
        </div>
        {/* Yellow Status */}
        <div className="col-md-3">
          <div className="border rounded bg-white px-3 py-3">
            <div className="text-muted medium mb-1">Yellow Status</div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="h3 mb-0">{counts.yellow}</div>
              <img
                src="/assets/WarningOctagon.svg"
                alt="Chart"
                style={{ width: "32px", height: "32px" }}
              />
            </div>
          </div>
        </div>
        {/* Green Status */}
        <div className="col-md-3">
          <div className="border rounded bg-white px-3 py-3">
            <div className="text-muted medium mb-1">Green Status</div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="h3 mb-0">{counts.green}</div>
              <img
                src="/assets/WarningOctagon.svg"
                alt="Chart"
                style={{ width: "32px", height: "32px" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Last Update, Search Bar, Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mt-1 flex-wrap gap-2">
        <div
          className="rounded px-2 py-2 text-dark small"
          style={{ backgroundColor: "#EEF2F6" }}
        >
          Last Update : {lastUpdate}
        </div>

        <div
          className="d-flex align-items-center gap-2 ms-auto flex-nowrap"
          ref={dropdownContainerRef}
        >
          <input
            type="text"
            placeholder="Search..."
            className={`form-control ${
              isSearchFocused ? "search-focused" : ""
            }`} // Dari perbaikan sebelumnya (untuk border merah)
            style={{
              width: "300px",
              transition:
                "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
            }}
            onFocus={() => {
              setIsSearchFocused(true); // State untuk border merah
              setActiveDropdown(null); // TUTUP SEMUA DROPDOWN OTOMATIS
              console.log("Search focused: Dropdown closed"); // Test: Cek console
            }}
            onBlur={() => {
              setIsSearchFocused(false); // Reset border
              console.log("Search blurred"); // Test
            }}
            // Opsional: Tambah onChange jika ada logic search (misal filter tabel)
            // onChange={(e) => handleSearch(e.target.value)}
          />

          <div className="position-relative me-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown("treg");
              }}
              className="btn d-flex align-items-center justify-content-between px-2 text-dark custom-btn"
              style={{
                backgroundColor: "#EEF2F6",
                width: "80px",
                height: "38px",
                outline: "none",
                transition: "boder-color, box-shadow 0.15s ease-in-out",
              }}
              // Inline focus/active style untuk border merah #CB3A31
              onFocus={(e) => {
                e.target.style.border = "1px solid #CB3A31";
                e.target.style.boxShadow =
                  "0 0 0 0.2rem rgba(203, 58, 49, 0.25)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid #dee2e6";
                e.target.style.boxShadow = "none";
              }}
            >
              <span>TREG</span>
              <img
                src="/assets/CaretDownBold.svg"
                alt="Caret"
                className="ms-2"
                style={{ width: "16px", height: "16px" }}
              />
            </button>
            {activeDropdown === "treg" && (
              <div
                className="position-absolute bg-white border rounded shadow-sm mt-1 w-100 z-3"
                style={{
                  minWidth: "84px", // TAMBAHAN: Lebar minimal 250px (cukup untuk opsi panjang)
                  width: "auto", // Auto-adjust jika konten lebih lebar
                  left: 0, // Align kanan agar tidak overlap button kiri
                }}
              >
                {["1", "2", "3", "4", "5"].map((num) => {
                  const tregOption = `TREG ${num}`;
                  const isChecked = selectedTregs.includes(tregOption);
                  return (
                    <div
                      key={num}
                      className="dropdown-item px-2 py-2 small d-flex align-items-center custom-hover"
                      style={{
                        cursor: "pointer",
                        transition:
                          "color 0.15s ease-in-out, background-color 0.15s ease-in-out",
                      }}
                      onMouseEnter={(e) => {
                        // Hover effect: Teks/label merah #CB3A31, background abu muda
                        e.currentTarget.style.color = "#CB3A31";
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                      }}
                      onMouseLeave={(e) => {
                        // Reset hover: Kembali ke default
                        e.currentTarget.style.color = "";
                        e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`treg-${num}`}
                        checked={isChecked}
                        onChange={() => handleTregCheckboxToggle(tregOption)} // Toggle dengan sort urutan
                        className="me-2 custom-checkbox"
                        style={{
                          cursor: "pointer",
                          accentColor: "#CB3A31", // Checkbox checked merah #CB3A31
                        }}
                      />
                      <label
                        htmlFor={`treg-${num}`}
                        className="mb-0 w-100"
                        style={{ cursor: "pointer" }}
                        onMouseEnter={(e) => {
                          e.target.style.color = "#CB3A31"; // Hover label merah
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = ""; // Reset label
                        }}
                      >
                        TREG {num}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="position-relative me-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown("taccan");
              }}
              className="btn d-flex align-items-center justify-content-between px-2 text-dark custom-btn"
              style={{
                backgroundColor: "#EEF2F6",
                width: "106px",
                height: "38px",
                outline: "none",
                transition:
                  "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #CB3A31";
                e.target.style.boxShadow =
                  "0 0 0 0.2rem rgba(203, 58, 49, 0.25)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid #dee2e6";
                e.target.style.boxShadow = "none";
              }}
            >
              <span>TA CCAN</span>
              <img
                src="/assets/CaretDownBold.svg"
                alt="Caret"
                className="ms-2"
                style={{ width: "16px", height: "16px" }}
              />
            </button>
            {activeDropdown === "taccan" && (
              <div className="position-absolute bg-white border rounded shadow-sm mt-1 w-100 z-3">
                {["CCAN A", "CCAN B", "CCAN C"].map((option, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionSelect(option, undefined, e); // Console.log, tidak ubah tabel
                    }}
                    className="dropdown-item text-start px-2 py-2 small custom-hover"
                    style={{
                      cursor: "pointer",
                      transition:
                        "color 0.15s ease-in-out, background-color 0.15s ease-in-out",
                      width: "100%",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#CB3A31"; // Hover teks merah
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = ""; // Reset
                      e.currentTarget.style.backgroundColor = "";
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="position-relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown("export");
              }}
              className="btn d-flex align-items-center justify-content-between px-2 text-dark custom-btn"
              style={{
                backgroundColor: "#EEF2F6",
                width: "115px",
                height: "38px",
                outline: "none",
                transition:
                  "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #CB3A31";
                e.target.style.boxShadow =
                  "0 0 0 0.2rem rgba(203, 58, 49, 0.25)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid #dee2e6";
                e.target.style.boxShadow = "none";
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <img
                  src="/assets/TrayArrowUp.svg"
                  alt="Export"
                  style={{ width: "20px", height: "20px" }}
                />
                Export
              </div>
              <img
                src="/assets/CaretDownBold.svg"
                alt="Caret"
                className="ms-2"
                style={{ width: "16px", height: "16px" }}
              />
            </button>
            {activeDropdown === "export" && (
              <div className="position-absolute bg-white border rounded shadow-sm mt-1 w-100 z-3">
                {["Export Data", "Export All Data"].map((option, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionSelect(option, undefined, e);
                    }}
                    className="dropdown-item text-start px-2 py-2 small custom-hover"
                    style={{
                      cursor: "pointer",
                      transition:
                        "color 0.15s ease-in-out, background-color 0.15s ease-in-out",
                      width: "100%",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#CB3A31";
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "";
                      e.currentTarget.style.backgroundColor = "";
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="position-relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown("upload");
              }}
              className="btn d-flex align-items-center justify-content-between px-2 text-dark custom-btn"
              style={{
                backgroundColor: "#EEF2F6",
                width: "160px",
                height: "38px",
                outline: "none",
                transition:
                  "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #CB3A31";
                e.target.style.boxShadow =
                  "0 0 0 0.2rem rgba(203, 58, 49, 0.25)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid #dee2e6";
                e.target.style.boxShadow = "none";
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <img
                  src="/assets/UploadSimple.svg"
                  alt="Upload"
                  style={{ width: "20px", height: "20px" }}
                />
                Upload Data
              </div>
              <img
                src="/assets/CaretDownBold.svg"
                alt="Caret"
                className="ms-2"
                style={{ width: "16px", height: "16px" }}
              />
            </button>
            {activeDropdown === "upload" && (
              <div
                className="position-absolute bg-white border rounded shadow-sm mt-1 w-102 z-3"
                style={{ right: 0, minWidth: "100%" }} // Sesuaikan width button
              >
                {[
                  "Upload File Stock",
                  "Upload File Delivery",
                  "Upload File Minimum Stock",
                ].map((option, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionSelect(option, undefined, e);
                    }}
                    className="dropdown-item text-start px-2 py-2 small custom-hover"
                    style={{
                      cursor: "pointer",
                      transition:
                        "color 0.15s ease-in-out, background-color 0.15s ease-in-out",
                      width: "100%",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#CB3A31";
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "";
                      e.currentTarget.style.backgroundColor = "";
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === Table === */}
      <div className="mt-4 mb-4">
        <div className="bg-white table-container-rounded">
          <div className="table-responsive">
            <table className="table table-bordered table-sm text-center table-custom">
              <thead className="bg-abu">
                <tr>
                  <th rowSpan="2" style={{ width: "300px" }}>
                    Warehouse
                  </th>
                  <th colSpan="4">
                    Stock SCMT
                    <br />
                    <small style={{ backgroundColor: "transparent" }}>(A)</small>
                  </th>
                  <th colSpan="2">
                    GAP Stock
                    <br />
                    <small style={{ backgroundColor: "transparent" }}>
                      (A + C - B)
                    </small>
                  </th>
                  <th colSpan="3">Kebutuhan</th>
                  <th colSpan="3">
                    Minimum Stock Requirement Retail
                    <br />
                    <small style={{ backgroundColor: "transparent" }}>(B)</small>
                  </th>
                  <th colSpan="2">
                    On Delivery
                    <br />
                    <small style={{ backgroundColor: "transparent" }}>(C)</small>
                  </th>
                </tr>
                <tr>
                  <th>Total Retail SB</th>
                  <th>Total Retail DB</th>
                  <th>Total Premium</th>
                  <th>Total ONT</th>
                  <th>Total Premium</th>
                  <th>Total ONT</th>
                  <th>Total Retail</th>
                  <th>Total Premium</th>
                  <th>Total ONT</th>
                  <th>Total Retail</th>
                  <th>Total Premium</th>
                  <th>Total ONT</th>
                  <th>Total Retail</th>
                  <th>Total Premium</th>
                </tr>
              </thead>

              <tbody>
                {currentTableRows.length > 0 ? (
                  currentTableRows.map((row, i) => (
                    <tr
                      key={row.warehouse || i} // Key unik berdasarkan warehouse (hindari React warning)
                      onClick={() => {
                        if (selectedLevel === "treg") {
                          setSelectedTreg(row.warehouse); // Gunakan row.warehouse (fixed dari tableData)
                          setSelectedLevel("witel");
                          setSelectedWitel(null);
                        } else if (selectedLevel === "witel") {
                          setSelectedWitel(row.warehouse); // Gunakan row.warehouse
                          setSelectedLevel("ta");
                        }
                        // Tidak drill-down untuk level "ta"
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="bg-abu fw-bold">
                        {row.warehouse || "N/A"}
                      </td>
                      <td>{row.totalRetailSB || 0}</td>
                      <td>{row.totalRetailDB || 0}</td>
                      <td>{row.totalPremiumSCMT || 0}</td>
                      <td>{row.totalONTSCMT || 0}</td>
                      <td>{row.totalPremiumGAP || 0}</td>
                      <td className="bg-success text-white fw-bold">
                        {row.totalONTGAP || 0}
                      </td>
                      <td>{row.totalRetailKebutuhan || 0}</td>
                      <td>{row.totalPremiumKebutuhan || 0}</td>
                      <td>{row.totalONTKebutuhan || 0}</td>
                      <td>{row.totalRetailMinStock || 0}</td>
                      <td>{row.totalPremiumMinStock || 0}</td>
                      <td>{row.totalONTMinStock || 0}</td>
                      <td>{row.totalRetailDelivery || 0}</td>
                      <td>{row.totalPremiumDelivery || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="15" className="text-center py-4">
                      No data available or loading...
                    </td>{" "}
                    {/* Fallback jika kosong */}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Tombol back biar bisa naik level */}
          {selectedLevel !== "treg" && (
            <div className="px-3 py-2">
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  if (selectedLevel === "ta") {
                    setSelectedLevel("witel");
                  } else if (selectedLevel === "witel") {
                    setSelectedLevel("treg");
                    setSelectedTreg(null);
                    setSelectedWitel(null);
                  }
                }}
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
