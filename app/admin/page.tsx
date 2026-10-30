"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import * as XLSX from "xlsx";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { DatabaseIcon } from "@phosphor-icons/react/dist/ssr/Database";
import { DesktopIcon } from "@phosphor-icons/react/dist/ssr/Desktop";
import { LaptopIcon } from "@phosphor-icons/react/dist/ssr/Laptop";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { LockKeyIcon } from "@phosphor-icons/react/dist/ssr/LockKey";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr/DownloadSimple";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/ssr/UploadSimple";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import { SunIcon } from "@phosphor-icons/react/dist/ssr/Sun";
import { MoonIcon } from "@phosphor-icons/react/dist/ssr/Moon";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { formatRupiah } from "@/lib/format";
import { BrandIcon, GoogleLogoIcon } from "@/components/ui/brand-icon";
import {
  catalogLaptops,
  CatalogLaptop,
} from "@/lib/catalog-service";
import {
  getLaptopsFromSupabase,
  insertLaptopToSupabase,
  updateLaptopInSupabase,
  deleteLaptopFromSupabase,
  batchMergeLaptopsToSupabase,
  SupabaseLaptop,
  isSupabaseConfigured,
  getCurrentUser,
  signInWithGoogle,
  isAdminUser,
  verifyPasskeyFromDatabase,
} from "@/lib/supabase";

export default function AdminPage() {
  // Theme State: 'light' | 'dark' (Default to Light Mode per user request)
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  // Admin Auth Gate State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = React.useState<boolean>(false);
  const [authChecking, setAuthChecking] = React.useState<boolean>(true);
  const [passkeyInput, setPasskeyInput] = React.useState<string>("");
  const [authError, setAuthError] = React.useState<string | null>(null);

  // Data & Filter State
  const [laptops, setLaptops] = React.useState<CatalogLaptop[]>(catalogLaptops);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | "laptop" | "minipc">("all");
  const [brandFilter, setBrandFilter] = React.useState<string>("all");
  const [jurusanFilter, setJurusanFilter] = React.useState<string>("all");
  const [kategoriFilter, setKategoriFilter] = React.useState<string>("all");
  const [completenessFilter, setCompletenessFilter] = React.useState<"all" | "missing_image" | "incomplete" | "complete">("all");
  const [sortOption, setSortOption] = React.useState<"default" | "price-asc" | "price-desc" | "ram-desc" | "weight-asc">("default");
  const [loading, setLoading] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(25);

  // Excel Import & Merge State
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [importFileName, setImportFileName] = React.useState("");
  const [importMergeList, setImportMergeList] = React.useState<Array<{
    id: string;
    brand: string;
    model: string;
    changes: Array<{ field: string; oldVal: string; newVal: string }>;
    payload: Partial<SupabaseLaptop>;
  }>>([]);
  const [isMerging, setIsMerging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // In-line Quick Editing State
  const [inlineEditingId, setInlineEditingId] = React.useState<string | null>(null);
  const [inlineValues, setInlineValues] = React.useState<{
    price: string;
    ram: string;
    storage: string;
    warranty: string;
  }>({ price: "", ram: "", storage: "", warranty: "" });
  const [savingInlineId, setSavingInlineId] = React.useState<string | null>(null);

  // Full Edit / Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingLaptop, setEditingLaptop] = React.useState<CatalogLaptop | null>(null);
  const [previewError, setPreviewError] = React.useState(false);
  const [showImagePreview, setShowImagePreview] = React.useState(true);

  // Table Mouse Drag-to-Scroll State
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const [isDraggingTable, setIsDraggingTable] = React.useState(false);
  const [dragStartX, setDragStartX] = React.useState(0);
  const [dragScrollLeft, setDragScrollLeft] = React.useState(0);

  const handleTableMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tableContainerRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("select") || target.closest("a")) {
      return;
    }
    setIsDraggingTable(true);
    setDragStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setDragScrollLeft(tableContainerRef.current.scrollLeft);
  };

  const handleTableMouseLeave = () => {
    setIsDraggingTable(false);
  };

  const handleTableMouseUp = () => {
    setIsDraggingTable(false);
  };

  const handleTableMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingTable || !tableContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    tableContainerRef.current.scrollLeft = dragScrollLeft - walk;
  };

  // All 20 exact dataset fields according to devices-catalog.json
  const [formData, setFormData] = React.useState({
    ID_Perangkat: "",
    Kategori_Target: "Teknik/Informatika",
    Target_Mahasiswa_Jurusan: "Informatika / Sains Data",
    Brand: "Advan",
    Model_Seri: "",
    Tipe_Perangkat: "Laptop",
    Processor_CPU: "",
    Kartu_Grafis_GPU: "",
    RAM_GB: "16",
    Upgradeable_RAM: "Ya",
    Storage_GB_Tipe: "512GB SSD NVMe",
    Layar_Ukuran_Panel_ColorGamut: "14 inci IPS FHD 100% sRGB",
    Bobot_kg: "1.4",
    Estimasi_Harga_Pasar_IDR: "7000000",
    Platform_Rekomendasi_Beli: "Tokopedia Official",
    Status_Garansi_Resmi: "1 Tahun Resmi Advan Indonesia",
    Rekomendasi_UseCase_Tag: "#coding #skripsi",
    Pros_Kelebihan: "",
    Cons_Kekurangan: "",
    Link_Gambar: "",
  });

  // Load Saved Theme Preference
  React.useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("speco_admin_theme") as "light" | "dark" | null;
      if (savedTheme === "dark" || savedTheme === "light") {
        // Tema tersimpan dibaca setelah mount agar render server dan klien tetap sama.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTheme(savedTheme);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      localStorage.setItem("speco_admin_theme", nextTheme);
    } catch {
      // ignore
    }
  };

  const isDark = theme === "dark";

  // Cek Status Admin Saat Mount
  React.useEffect(() => {
    async function verifyAdminAuth() {
      try {
        const localAuth = localStorage.getItem("speco_admin_session");
        if (localAuth === "authorized_lead_affif") {
          setIsAdminAuthenticated(true);
          setAuthChecking(false);
          return;
        }

        if (isSupabaseConfigured) {
          const user = await getCurrentUser();
          if (user) {
            const isAuthorizedAdmin = await isAdminUser(user);
            if (isAuthorizedAdmin) {
              setIsAdminAuthenticated(true);
              localStorage.setItem("speco_admin_session", "authorized_lead_affif");
              setAuthChecking(false);
              return;
            }
          }
        }
      } catch (e) {
        console.warn("Auth check warning:", e);
      } finally {
        setAuthChecking(false);
      }
    }
    verifyAdminAuth();
  }, []);

  // Fetch Supabase Data
  React.useEffect(() => {
    async function fetchSupabaseData() {
      if (!isSupabaseConfigured || !isAdminAuthenticated) return;
      setLoading(true);
      try {
        const data = await getLaptopsFromSupabase();
        if (data && data.length > 0) {
          const mapped: CatalogLaptop[] = data.map((d) => ({
            ID_Perangkat: d.id,
            Kategori_Target: d.category || "Mahasiswa",
            Target_Mahasiswa_Jurusan: d.major_target || "Semua Jurusan",
            Brand: d.brand,
            Model_Seri: d.model,
            Tipe_Perangkat: d.device_type || (d.model.toLowerCase().includes("mini") ? "Mini PC" : "Laptop"),
            Processor_CPU: d.cpu,
            Kartu_Grafis_GPU: d.gpu,
            RAM_GB: d.ram_gb,
            Upgradeable_RAM: d.ram_upgradable ? "Ya" : "Tidak",
            Storage_GB_Tipe: d.storage,
            Layar_Ukuran_Panel_ColorGamut: d.display,
            Bobot_kg: d.weight_kg,
            Estimasi_Harga_Pasar_IDR: d.price_idr,
            Platform_Rekomendasi_Beli: d.buy_url || "Tokopedia",
            Status_Garansi_Resmi: d.warranty || "Resmi",
            Rekomendasi_UseCase_Tag: d.usecase_tag || "#kuliah",
            Pros_Kelebihan: d.pros || "",
            Cons_Kekurangan: d.cons || "",
            Link_Gambar: d.image_url || "",
            numericPrice: Number(d.price_idr) || 0,
            numericRam: Number(d.ram_gb) || 8,
            numericWeight: Number(d.weight_kg) || 1.4,
          }));
          setLaptops(mapped);
        }
      } catch (err) {
        console.warn("Gagal sinkron data Supabase:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSupabaseData();
  }, [isAdminAuthenticated]);

  // Handle Login Admin Form Gate
  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      const isValid = await verifyPasskeyFromDatabase(passkeyInput);
      if (isValid) {
        localStorage.setItem("speco_admin_session", "authorized_lead_affif");
        localStorage.setItem(
          "speco_user_session",
          JSON.stringify({
            name: "Admin Otoritas",
            email: "admin@speco.id",
            role: "admin",
          })
        );
        setIsAdminAuthenticated(true);
      } else {
        setAuthError("Passkey ditolak atau tidak terdaftar di sistem.");
      }
    } catch {
      setAuthError("Gagal menghubungi server verifikasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem("speco_admin_session");
    setIsAdminAuthenticated(false);
  };

  // Filter & Search Logic
  const filteredLaptops = React.useMemo(() => {
    let result = [...laptops];

    if (typeFilter === "laptop") {
      result = result.filter((l) => (l.Tipe_Perangkat || "Laptop").toLowerCase().includes("laptop"));
    } else if (typeFilter === "minipc") {
      result = result.filter((l) => (l.Tipe_Perangkat || "").toLowerCase().includes("mini"));
    }

    if (brandFilter !== "all") {
      result = result.filter((l) => l.Brand.toLowerCase() === brandFilter.toLowerCase());
    }

    if (jurusanFilter !== "all") {
      result = result.filter((l) => (l.Target_Mahasiswa_Jurusan || "").toLowerCase().includes(jurusanFilter.toLowerCase()));
    }

    if (kategoriFilter !== "all") {
      result = result.filter((l) => (l.Kategori_Target || "").toLowerCase().includes(kategoriFilter.toLowerCase()));
    }

    // Filter Status Kelengkapan Data (Audit Null / Kosong)
    if (completenessFilter === "missing_image") {
      result = result.filter((l) => !l.Link_Gambar || !l.Link_Gambar.trim());
    } else if (completenessFilter === "incomplete") {
      result = result.filter((l) => {
        return (
          !l.Link_Gambar || !l.Link_Gambar.trim() ||
          !l.Pros_Kelebihan || !l.Pros_Kelebihan.trim() ||
          !l.Cons_Kekurangan || !l.Cons_Kekurangan.trim() ||
          !l.Rekomendasi_UseCase_Tag || !l.Rekomendasi_UseCase_Tag.trim()
        );
      });
    } else if (completenessFilter === "complete") {
      result = result.filter((l) => {
        return (
          Boolean(l.Link_Gambar && l.Link_Gambar.trim()) &&
          Boolean(l.Pros_Kelebihan && l.Pros_Kelebihan.trim()) &&
          Boolean(l.Cons_Kekurangan && l.Cons_Kekurangan.trim()) &&
          Boolean(l.Rekomendasi_UseCase_Tag && l.Rekomendasi_UseCase_Tag.trim())
        );
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.ID_Perangkat.toLowerCase().includes(q) ||
          l.Model_Seri.toLowerCase().includes(q) ||
          l.Processor_CPU.toLowerCase().includes(q) ||
          l.Kartu_Grafis_GPU.toLowerCase().includes(q) ||
          (l.Target_Mahasiswa_Jurusan || "").toLowerCase().includes(q) ||
          l.Brand.toLowerCase().includes(q)
      );
    }

    if (sortOption === "price-asc") {
      result.sort((a, b) => (Number(a.Estimasi_Harga_Pasar_IDR) || 0) - (Number(b.Estimasi_Harga_Pasar_IDR) || 0));
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => (Number(b.Estimasi_Harga_Pasar_IDR) || 0) - (Number(a.Estimasi_Harga_Pasar_IDR) || 0));
    } else if (sortOption === "ram-desc") {
      result.sort((a, b) => (Number(b.RAM_GB) || 0) - (Number(a.RAM_GB) || 0));
    } else if (sortOption === "weight-asc") {
      result.sort((a, b) => (Number(a.Bobot_kg) || 0) - (Number(b.Bobot_kg) || 0));
    }

    return result;
  }, [laptops, search, typeFilter, brandFilter, jurusanFilter, kategoriFilter, completenessFilter, sortOption]);

  // Pagination Slicing
  const totalPages = Math.ceil(filteredLaptops.length / itemsPerPage) || 1;
  const paginatedLaptops = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLaptops.slice(start, start + itemsPerPage);
  }, [filteredLaptops, currentPage, itemsPerPage]);

  // Hitung Metrik Dashboard & Audit Kelengkapan Data
  const metrics = React.useMemo(() => {
    const total = laptops.length;
    const countLaptop = laptops.filter((l) => (l.Tipe_Perangkat || "Laptop").toLowerCase().includes("laptop")).length;
    const countMiniPc = laptops.filter((l) => (l.Tipe_Perangkat || "").toLowerCase().includes("mini")).length;
    const totalHarga = laptops.reduce((acc, curr) => acc + (Number(curr.Estimasi_Harga_Pasar_IDR) || 0), 0);
    const avgHarga = total > 0 ? Math.round(totalHarga / total) : 0;
    const countLokal = laptops.filter((l) => ["axioo", "advan", "zyrex"].includes(l.Brand.toLowerCase())).length;

    const missingImagesCount = laptops.filter((l) => !l.Link_Gambar || !l.Link_Gambar.trim()).length;
    const incompleteCount = laptops.filter((l) => {
      return (
        !l.Link_Gambar || !l.Link_Gambar.trim() ||
        !l.Pros_Kelebihan || !l.Pros_Kelebihan.trim() ||
        !l.Cons_Kekurangan || !l.Cons_Kekurangan.trim() ||
        !l.Rekomendasi_UseCase_Tag || !l.Rekomendasi_UseCase_Tag.trim()
      );
    }).length;
    const completeCount = total - incompleteCount;

    return { total, countLaptop, countMiniPc, avgHarga, countLokal, missingImagesCount, incompleteCount, completeCount };
  }, [laptops]);

  // Quick In-Line Editing Handlers
  const handleStartInlineEdit = (item: CatalogLaptop) => {
    setInlineEditingId(item.ID_Perangkat);
    setInlineValues({
      price: String(item.Estimasi_Harga_Pasar_IDR || ""),
      ram: String(item.RAM_GB || ""),
      storage: item.Storage_GB_Tipe || "",
      warranty: item.Status_Garansi_Resmi || "",
    });
  };

  const handleCancelInlineEdit = () => {
    setInlineEditingId(null);
  };

  const handleSaveInlineEdit = async (id: string) => {
    setSavingInlineId(id);
    try {
      const target = laptops.find((l) => l.ID_Perangkat === id);
      if (!target) return;

      const updatedItem: CatalogLaptop = {
        ...target,
        Estimasi_Harga_Pasar_IDR: inlineValues.price,
        RAM_GB: inlineValues.ram,
        Storage_GB_Tipe: inlineValues.storage,
        Status_Garansi_Resmi: inlineValues.warranty,
        numericPrice: Number(inlineValues.price) || target.numericPrice,
        numericRam: Number(inlineValues.ram) || target.numericRam,
      };

      if (isSupabaseConfigured) {
        try {
          await updateLaptopInSupabase(id, {
            price_idr: Number(inlineValues.price) || 0,
            ram_gb: Number(inlineValues.ram) || 8,
            storage: inlineValues.storage,
            warranty: inlineValues.warranty,
          });
        } catch (e) {
          console.warn("Gagal update realtime ke Supabase:", e);
        }
      }

      setLaptops((prev) => prev.map((l) => (l.ID_Perangkat === id ? updatedItem : l)));
      setInlineEditingId(null);
      setStatusMsg(`Berhasil memperbarui data perangkat ${id} secara realtime.`);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch {
      setStatusMsg("Gagal menyimpan perubahan inline.");
    } finally {
      setSavingInlineId(null);
    }
  };

  // Full Edit / Add Handlers
  const handleAddNewClick = () => {
    setEditingLaptop(null);
    const nextIdNum = laptops.length + 1;
    const generatedId = `LP${String(nextIdNum).padStart(3, "0")}`;

    setFormData({
      ID_Perangkat: generatedId,
      Kategori_Target: "Teknik/Informatika",
      Target_Mahasiswa_Jurusan: "Informatika / Sains Data",
      Brand: "Advan",
      Model_Seri: "",
      Tipe_Perangkat: "Laptop",
      Processor_CPU: "",
      Kartu_Grafis_GPU: "",
      RAM_GB: "16",
      Upgradeable_RAM: "Ya",
      Storage_GB_Tipe: "512GB SSD NVMe",
      Layar_Ukuran_Panel_ColorGamut: "14 inci IPS FHD 100% sRGB",
      Bobot_kg: "1.4",
      Estimasi_Harga_Pasar_IDR: "7000000",
      Platform_Rekomendasi_Beli: "Tokopedia Official",
      Status_Garansi_Resmi: "1 Tahun Resmi Advan Indonesia",
      Rekomendasi_UseCase_Tag: "#coding #skripsi",
      Pros_Kelebihan: "",
      Cons_Kekurangan: "",
      Link_Gambar: "",
    });
    setPreviewError(false);
    setShowImagePreview(true);
    setIsAddModalOpen(true);
  };

  const handleEditClick = (item: CatalogLaptop) => {
    setEditingLaptop(item);
    setFormData({
      ID_Perangkat: item.ID_Perangkat,
      Kategori_Target: item.Kategori_Target || "Teknik/Informatika",
      Target_Mahasiswa_Jurusan: item.Target_Mahasiswa_Jurusan || "Informatika / Sains Data",
      Brand: item.Brand,
      Model_Seri: item.Model_Seri,
      Tipe_Perangkat: item.Tipe_Perangkat || "Laptop",
      Processor_CPU: item.Processor_CPU,
      Kartu_Grafis_GPU: item.Kartu_Grafis_GPU,
      RAM_GB: String(item.RAM_GB),
      Upgradeable_RAM: item.Upgradeable_RAM || "Ya",
      Storage_GB_Tipe: item.Storage_GB_Tipe,
      Layar_Ukuran_Panel_ColorGamut: item.Layar_Ukuran_Panel_ColorGamut,
      Bobot_kg: String(item.Bobot_kg),
      Estimasi_Harga_Pasar_IDR: String(item.Estimasi_Harga_Pasar_IDR),
      Platform_Rekomendasi_Beli: item.Platform_Rekomendasi_Beli || "Tokopedia Official",
      Status_Garansi_Resmi: item.Status_Garansi_Resmi,
      Rekomendasi_UseCase_Tag: item.Rekomendasi_UseCase_Tag || "#coding",
      Pros_Kelebihan: item.Pros_Kelebihan || "",
      Cons_Kekurangan: item.Cons_Kekurangan || "",
      Link_Gambar: item.Link_Gambar || "",
    });
    setPreviewError(false);
    setShowImagePreview(true);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm(`Hapus permanen perangkat ${id} dari database katalog?`)) return;

    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        await deleteLaptopFromSupabase(id);
      }
      setLaptops((prev) => prev.filter((l) => l.ID_Perangkat !== id));
      setStatusMsg(`Perangkat ${id} berhasil dihapus dari database.`);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch {
      setStatusMsg("Gagal menghapus perangkat.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const itemToSave: CatalogLaptop = {
        ID_Perangkat: formData.ID_Perangkat,
        Kategori_Target: formData.Kategori_Target,
        Target_Mahasiswa_Jurusan: formData.Target_Mahasiswa_Jurusan,
        Brand: formData.Brand,
        Model_Seri: formData.Model_Seri,
        Tipe_Perangkat: formData.Tipe_Perangkat,
        Processor_CPU: formData.Processor_CPU,
        Kartu_Grafis_GPU: formData.Kartu_Grafis_GPU,
        RAM_GB: formData.RAM_GB,
        Upgradeable_RAM: formData.Upgradeable_RAM,
        Storage_GB_Tipe: formData.Storage_GB_Tipe,
        Layar_Ukuran_Panel_ColorGamut: formData.Layar_Ukuran_Panel_ColorGamut,
        Bobot_kg: formData.Bobot_kg,
        Estimasi_Harga_Pasar_IDR: formData.Estimasi_Harga_Pasar_IDR,
        Platform_Rekomendasi_Beli: formData.Platform_Rekomendasi_Beli,
        Status_Garansi_Resmi: formData.Status_Garansi_Resmi,
        Rekomendasi_UseCase_Tag: formData.Rekomendasi_UseCase_Tag,
        Pros_Kelebihan: formData.Pros_Kelebihan,
        Cons_Kekurangan: formData.Cons_Kekurangan,
        Link_Gambar: formData.Link_Gambar,
        numericPrice: Number(formData.Estimasi_Harga_Pasar_IDR) || 0,
        numericRam: Number(formData.RAM_GB) || 8,
        numericWeight: Number(formData.Bobot_kg) || 1.4,
      };

      if (isSupabaseConfigured) {
        const supabasePayload: Partial<SupabaseLaptop> = {
          id: formData.ID_Perangkat,
          brand: formData.Brand,
          model: formData.Model_Seri,
          device_type: formData.Tipe_Perangkat,
          category: formData.Kategori_Target,
          major_target: formData.Target_Mahasiswa_Jurusan,
          cpu: formData.Processor_CPU,
          gpu: formData.Kartu_Grafis_GPU,
          ram_gb: Number(formData.RAM_GB) || 8,
          ram_upgradable: formData.Upgradeable_RAM.toLowerCase() === "ya",
          storage: formData.Storage_GB_Tipe,
          display: formData.Layar_Ukuran_Panel_ColorGamut,
          weight_kg: Number(formData.Bobot_kg) || 1.4,
          price_idr: Number(formData.Estimasi_Harga_Pasar_IDR) || 0,
          buy_url: formData.Platform_Rekomendasi_Beli,
          warranty: formData.Status_Garansi_Resmi,
          usecase_tag: formData.Rekomendasi_UseCase_Tag,
          pros: formData.Pros_Kelebihan,
          cons: formData.Cons_Kekurangan,
          image_url: formData.Link_Gambar,
        };

        if (editingLaptop) {
          await updateLaptopInSupabase(formData.ID_Perangkat, supabasePayload);
        } else {
          await insertLaptopToSupabase(supabasePayload);
        }
      }

      if (editingLaptop) {
        setLaptops((prev) =>
          prev.map((l) => (l.ID_Perangkat === formData.ID_Perangkat ? itemToSave : l))
        );
        setStatusMsg(`Data perangkat ${formData.ID_Perangkat} berhasil diperbarui.`);
      } else {
        setLaptops((prev) => [itemToSave, ...prev]);
        setStatusMsg(`Perangkat baru ${formData.ID_Perangkat} berhasil ditambahkan.`);
      }

      setIsAddModalOpen(false);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      alert(`Gagal menyimpan data: ${(err instanceof Error ? err.message : "") || "Kesalahan internal"}`);
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel (.xlsx) Handlers (Mendukung Ekspor Data Terfilter / Missing Data)
  const handleExportXLSX = () => {
    try {
      const isFiltered = completenessFilter !== "all" || brandFilter !== "all" || jurusanFilter !== "all" || search.trim() !== "";
      const exportTarget = isFiltered ? filteredLaptops : laptops;

      const exportData = exportTarget.map((l) => ({
        ID_Perangkat: l.ID_Perangkat,
        Brand: l.Brand,
        Model_Seri: l.Model_Seri,
        Tipe_Perangkat: l.Tipe_Perangkat,
        Kategori_Target: l.Kategori_Target,
        Target_Mahasiswa_Jurusan: l.Target_Mahasiswa_Jurusan,
        Processor_CPU: l.Processor_CPU,
        Kartu_Grafis_GPU: l.Kartu_Grafis_GPU,
        RAM_GB: l.RAM_GB,
        Upgradeable_RAM: l.Upgradeable_RAM,
        Storage_GB_Tipe: l.Storage_GB_Tipe,
        Layar_Ukuran_Panel_ColorGamut: l.Layar_Ukuran_Panel_ColorGamut,
        Bobot_kg: l.Bobot_kg,
        Estimasi_Harga_Pasar_IDR: l.Estimasi_Harga_Pasar_IDR,
        Platform_Rekomendasi_Beli: l.Platform_Rekomendasi_Beli,
        Status_Garansi_Resmi: l.Status_Garansi_Resmi,
        Rekomendasi_UseCase_Tag: l.Rekomendasi_UseCase_Tag,
        Pros_Kelebihan: l.Pros_Kelebihan,
        Cons_Kekurangan: l.Cons_Kekurangan,
        Link_Gambar: l.Link_Gambar,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Katalog_Laptop");

      let fileName = `SPECO_Dataset_${exportTarget.length}_Laptop_${new Date().toISOString().slice(0, 10)}.xlsx`;
      if (completenessFilter === "missing_image") {
        fileName = `SPECO_Perlu_Dilengkapi_Gambar_${exportTarget.length}_Unit.xlsx`;
      } else if (completenessFilter === "incomplete") {
        fileName = `SPECO_Data_Belum_Lengkap_${exportTarget.length}_Unit.xlsx`;
      }

      XLSX.writeFile(wb, fileName);
      setStatusMsg(`Berkas Excel (${exportTarget.length} data) berhasil diunduh: ${fileName}`);
      setTimeout(() => setStatusMsg(null), 3500);
    } catch {
      alert("Gagal mengekspor file Excel.");
    }
  };

  // Helper untuk mengekstrak nilai dari row Excel berdasarkan variasi nama kolom
  const extractVal = (row: Record<string, unknown>, ...keys: string[]): string | undefined => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
        return String(row[k]).trim();
      }
      const matched = Object.keys(row).find(
        (rk) => rk.toLowerCase().replace(/[\s_-]/g, "") === k.toLowerCase().replace(/[\s_-]/g, "")
      );
      if (matched && row[matched] !== undefined && row[matched] !== null && String(row[matched]).trim() !== "") {
        return String(row[matched]).trim();
      }
    }
    return undefined;
  };

  // Upload & Parse Excel (.xlsx) untuk Melakukan Merge Data
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportFileName(file.name);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      if (!rawJson || rawJson.length === 0) {
        alert("File Excel kosong atau tidak memiliki baris data yang valid.");
        return;
      }

      const mergeResults: Array<{
        id: string;
        brand: string;
        model: string;
        changes: Array<{ field: string; oldVal: string; newVal: string }>;
        payload: Partial<SupabaseLaptop>;
      }> = [];

      for (const row of rawJson) {
        const id = extractVal(row, "ID_Perangkat", "id", "ID", "id_perangkat");
        if (!id) continue;

        const existing = laptops.find((l) => l.ID_Perangkat.toLowerCase() === id.toLowerCase());
        if (!existing) continue;

        const changes: Array<{ field: string; oldVal: string; newVal: string }> = [];
        const payload: Partial<SupabaseLaptop> = {};

        // 1. Link Gambar
        const newImg = extractVal(row, "Link_Gambar", "image_url", "Gambar", "Link Gambar", "URL Gambar");
        if (newImg !== undefined && newImg !== (existing.Link_Gambar || "")) {
          changes.push({
            field: "URL Gambar",
            oldVal: existing.Link_Gambar || "(Kosong)",
            newVal: newImg,
          });
          payload.image_url = newImg;
        }

        // 2. Pros (Kelebihan)
        const newPros = extractVal(row, "Pros_Kelebihan", "pros", "Kelebihan", "Pros");
        if (newPros !== undefined && newPros !== (existing.Pros_Kelebihan || "")) {
          changes.push({
            field: "Kelebihan (Pros)",
            oldVal: existing.Pros_Kelebihan || "(Kosong)",
            newVal: newPros,
          });
          payload.pros = newPros;
        }

        // 3. Cons (Kekurangan)
        const newCons = extractVal(row, "Cons_Kekurangan", "cons", "Kekurangan", "Cons");
        if (newCons !== undefined && newCons !== (existing.Cons_Kekurangan || "")) {
          changes.push({
            field: "Kekurangan (Cons)",
            oldVal: existing.Cons_Kekurangan || "(Kosong)",
            newVal: newCons,
          });
          payload.cons = newCons;
        }

        // 4. Rekomendasi UseCase Tag
        const newTag = extractVal(row, "Rekomendasi_UseCase_Tag", "usecase_tag", "Tag", "Tags");
        if (newTag !== undefined && newTag !== (existing.Rekomendasi_UseCase_Tag || "")) {
          changes.push({
            field: "UseCase Tag",
            oldVal: existing.Rekomendasi_UseCase_Tag || "(Kosong)",
            newVal: newTag,
          });
          payload.usecase_tag = newTag;
        }

        // 5. Harga
        const newPrice = extractVal(row, "Estimasi_Harga_Pasar_IDR", "price_idr", "Harga");
        if (newPrice !== undefined && Number(newPrice) !== Number(existing.Estimasi_Harga_Pasar_IDR)) {
          changes.push({
            field: "Harga Pasar",
            oldVal: formatRupiah(Number(existing.Estimasi_Harga_Pasar_IDR) || 0),
            newVal: formatRupiah(Number(newPrice) || 0),
          });
          payload.price_idr = Number(newPrice);
        }

        // 6. Garansi
        const newWarranty = extractVal(row, "Status_Garansi_Resmi", "warranty", "Garansi");
        if (newWarranty !== undefined && newWarranty !== (existing.Status_Garansi_Resmi || "")) {
          changes.push({
            field: "Garansi",
            oldVal: existing.Status_Garansi_Resmi || "(Kosong)",
            newVal: newWarranty,
          });
          payload.warranty = newWarranty;
        }

        // 7. Platform Beli
        const newBuyUrl = extractVal(row, "Platform_Rekomendasi_Beli", "buy_url", "Platform Beli");
        if (newBuyUrl !== undefined && newBuyUrl !== (existing.Platform_Rekomendasi_Beli || "")) {
          changes.push({
            field: "Platform Beli",
            oldVal: existing.Platform_Rekomendasi_Beli || "(Kosong)",
            newVal: newBuyUrl,
          });
          payload.buy_url = newBuyUrl;
        }

        if (changes.length > 0) {
          mergeResults.push({
            id: existing.ID_Perangkat,
            brand: existing.Brand,
            model: existing.Model_Seri,
            changes,
            payload,
          });
        }
      }

      if (mergeResults.length === 0) {
        alert("Tidak ditemukan perbedaan data antara berkas Excel yang diunggah dengan database katalog saat ini.");
        return;
      }

      setImportMergeList(mergeResults);
      setIsImportModalOpen(true);
    } catch (err) {
      alert(`Gagal membaca file Excel: ${(err instanceof Error ? err.message : "") || "Format file tidak didukung"}`);
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  // Eksekusi Batch Merge ke Supabase
  const handleExecuteMerge = async () => {
    if (importMergeList.length === 0) return;
    setIsMerging(true);

    try {
      const batchPayload = importMergeList.map((item) => ({
        id: item.id,
        updates: item.payload,
      }));

      const res = await batchMergeLaptopsToSupabase(batchPayload);

      // Merge ke local state
      setLaptops((prev) =>
        prev.map((l) => {
          const match = importMergeList.find((m) => m.id.toLowerCase() === l.ID_Perangkat.toLowerCase());
          if (!match) return l;

          return {
            ...l,
            Link_Gambar: match.payload.image_url !== undefined ? match.payload.image_url : l.Link_Gambar,
            Pros_Kelebihan: match.payload.pros !== undefined ? match.payload.pros : l.Pros_Kelebihan,
            Cons_Kekurangan: match.payload.cons !== undefined ? match.payload.cons : l.Cons_Kekurangan,
            Rekomendasi_UseCase_Tag: match.payload.usecase_tag !== undefined ? match.payload.usecase_tag : l.Rekomendasi_UseCase_Tag,
            Estimasi_Harga_Pasar_IDR: match.payload.price_idr !== undefined ? String(match.payload.price_idr) : l.Estimasi_Harga_Pasar_IDR,
            numericPrice: match.payload.price_idr !== undefined ? match.payload.price_idr : l.numericPrice,
            Status_Garansi_Resmi: match.payload.warranty !== undefined ? match.payload.warranty : l.Status_Garansi_Resmi,
            Platform_Rekomendasi_Beli: match.payload.buy_url !== undefined ? match.payload.buy_url : l.Platform_Rekomendasi_Beli,
          };
        })
      );

      setStatusMsg(`Berhasil me-merge ${res.updatedCount || importMergeList.length} perangkat langsung ke database Supabase!`);
      setIsImportModalOpen(false);
      setImportMergeList([]);
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      alert(`Gagal menjalankan merge: ${(err instanceof Error ? err.message : "") || "Kesalahan internal"}`);
    } finally {
      setIsMerging(false);
    }
  };

  // Export to SQL (.sql) Handlers
  const handleExportSQL = () => {
    try {
      let sql = `-- =============================================================================\n`;
      sql += `-- SPECO DATABASE DUMP - 450 LAPTOP & DESKTOP MAHASISWA\n`;
      sql += `-- Export Date: ${new Date().toISOString()}\n`;
      sql += `-- Platform: SPECO Laptop Advisor (TIM SPECO 7A)\n`;
      sql += `-- =============================================================================\n\n`;

      sql += `CREATE TABLE IF NOT EXISTS public.laptops (\n`;
      sql += `  id VARCHAR(50) PRIMARY KEY,\n`;
      sql += `  brand VARCHAR(100) NOT NULL,\n`;
      sql += `  model VARCHAR(255) NOT NULL,\n`;
      sql += `  device_type VARCHAR(50) DEFAULT 'Laptop',\n`;
      sql += `  category VARCHAR(100),\n`;
      sql += `  major_target VARCHAR(150),\n`;
      sql += `  cpu VARCHAR(200) NOT NULL,\n`;
      sql += `  gpu VARCHAR(200) NOT NULL,\n`;
      sql += `  ram_gb NUMERIC NOT NULL,\n`;
      sql += `  ram_upgradable BOOLEAN DEFAULT true,\n`;
      sql += `  storage VARCHAR(200) NOT NULL,\n`;
      sql += `  display VARCHAR(200) NOT NULL,\n`;
      sql += `  weight_kg NUMERIC NOT NULL,\n`;
      sql += `  price_idr NUMERIC NOT NULL,\n`;
      sql += `  buy_url TEXT,\n`;
      sql += `  warranty VARCHAR(150),\n`;
      sql += `  usecase_tag TEXT,\n`;
      sql += `  pros TEXT,\n`;
      sql += `  cons TEXT,\n`;
      sql += `  image_url TEXT,\n`;
      sql += `  created_at TIMESTAMPTZ DEFAULT NOW()\n`;
      sql += `);\n\n`;

      sql += `INSERT INTO public.laptops (id, brand, model, device_type, category, major_target, cpu, gpu, ram_gb, ram_upgradable, storage, display, weight_kg, price_idr, buy_url, warranty, usecase_tag, pros, cons, image_url)\nVALUES\n`;

      const values = laptops.map((l) => {
        const esc = (str: unknown) => `'${String(str || "").replace(/'/g, "''")}'`;
        const num = (val: unknown) => Number(val) || 0;
        const bool = (val: unknown) => (String(val).toLowerCase() === "ya" ? "true" : "false");

        return `  (${esc(l.ID_Perangkat)}, ${esc(l.Brand)}, ${esc(l.Model_Seri)}, ${esc(l.Tipe_Perangkat || "Laptop")}, ${esc(l.Kategori_Target)}, ${esc(l.Target_Mahasiswa_Jurusan)}, ${esc(l.Processor_CPU)}, ${esc(l.Kartu_Grafis_GPU)}, ${num(l.RAM_GB)}, ${bool(l.Upgradeable_RAM)}, ${esc(l.Storage_GB_Tipe)}, ${esc(l.Layar_Ukuran_Panel_ColorGamut)}, ${num(l.Bobot_kg)}, ${num(l.Estimasi_Harga_Pasar_IDR)}, ${esc(l.Platform_Rekomendasi_Beli)}, ${esc(l.Status_Garansi_Resmi)}, ${esc(l.Rekomendasi_UseCase_Tag)}, ${esc(l.Pros_Kelebihan)}, ${esc(l.Cons_Kekurangan)}, ${esc(l.Link_Gambar)})`;
      });

      sql += values.join(",\n");
      sql += `\nON CONFLICT (id) DO UPDATE SET\n`;
      sql += `  brand = EXCLUDED.brand,\n`;
      sql += `  model = EXCLUDED.model,\n`;
      sql += `  price_idr = EXCLUDED.price_idr,\n`;
      sql += `  ram_gb = EXCLUDED.ram_gb,\n`;
      sql += `  storage = EXCLUDED.storage,\n`;
      sql += `  warranty = EXCLUDED.warranty;\n`;

      const blob = new Blob([sql], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `SPECO_Database_Dump_${new Date().toISOString().slice(0, 10)}.sql`;
      link.click();
      URL.revokeObjectURL(url);
      setStatusMsg("Berkas SQL (.sql) berhasil diekspor.");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch {
      alert("Gagal mengekspor file SQL.");
    }
  };

  // Auth Checking Spinner
  if (authChecking) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
        isDark ? "bg-[#0b1120] text-slate-100" : "bg-[#faf8ff] text-slate-900"
      }`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-500">Memeriksa hak akses otoritas staff...</span>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // AUTH GATE SCREEN (LIGHT & DARK DUAL THEME)
  // ==============================================================================
  if (!isAdminAuthenticated) {
    return (
      <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-slate-950 font-sans transition-colors ${
        isDark ? "bg-[#0b1120] text-slate-100" : "bg-[#faf8ff] text-slate-900"
      }`}>
        {/* Floating Theme Toggle in Auth Screen */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl border shadow-sm transition-all flex items-center gap-2 text-xs font-bold ${
              isDark
                ? "bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            title={isDark ? "Ubah ke Mode Terang (Light Mode)" : "Ubah ke Mode Gelap (Dark Mode)"}
          >
            {isDark ? <SunIcon className="w-4 h-4 text-amber-300" /> : <MoonIcon className="w-4 h-4 text-slate-600" />}
            <span>{isDark ? "Mode Terang" : "Mode Gelap"}</span>
          </button>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-5 hover:opacity-95 transition-opacity">
            <Image
              src="/brand/speco-logo.png"
              alt="SPECO"
              width={140}
              height={50}
              priority
              className={`h-10 w-auto object-contain ${isDark ? "brightness-0 invert" : ""}`}
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Staff Command Console</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Portal Manajemen Database Staff
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Akses otoritas khusus tim pengembang data TIM SPECO (Kelompok 7A).
          </p>
        </div>

        <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className={`py-8 px-6 sm:px-10 rounded-3xl shadow-xl border space-y-5 transition-colors ${
            isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200/90"
          }`}>
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                {authError}
              </div>
            )}

            <button
              type="button"
              onClick={async () => {
                try {
                  setLoading(true);
                  await signInWithGoogle(`${window.location.origin}/admin`);
                } catch (e) {
                  setAuthError((e instanceof Error ? e.message : "") || "Gagal login Google.");
                  setLoading(false);
                }
              }}
              disabled={loading}
              className={`w-full h-11 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer border ${
                isDark
                  ? "bg-white hover:bg-slate-100 text-slate-900 border-white"
                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-300"
              }`}
            >
              <GoogleLogoIcon className="w-4 h-4" />
              <span>Masuk dengan Google (Akun Admin)</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? "border-slate-800" : "border-slate-200"}`} />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className={`px-3 font-semibold font-mono ${isDark ? "bg-slate-900 text-slate-500" : "bg-white text-slate-400"}`}>
                  Atau via Passkey Otoritas
                </span>
              </div>
            </div>

            <form onSubmit={handlePasskeySubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Passkey Otoritas Staff
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passkeyInput}
                    onChange={(e) => setPasskeyInput(e.target.value)}
                    placeholder="Masukkan passkey staff..."
                    className={`w-full h-11 px-3.5 pl-10 rounded-xl border focus:ring-2 text-xs outline-none font-mono transition-colors ${
                      isDark
                        ? "bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-emerald-600/20"
                    }`}
                  />
                  <LockKeyIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-300" />
                    <span>Verifikasi & Masuk Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda SPECO</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // DASHBOARD STAFF RESMI (AUTHENTICATED) - FULL LIGHT & DARK MODE SUPPORT
  // ==============================================================================
  return (
    <div className={`min-h-screen font-sans transition-colors ${
      isDark
        ? "bg-[#0b1120] text-slate-100 selection:bg-emerald-500 selection:text-slate-950"
        : "bg-[#faf8ff] text-slate-900 selection:bg-emerald-200 selection:text-emerald-950"
    }`}>
      {/* 1. UPGRADED ENTERPRISE TASKBAR HEADER */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors shadow-2xs ${
        isDark
          ? "bg-slate-900/90 border-slate-800/80"
          : "bg-white/90 border-slate-200/80"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between gap-4">
          {/* Left: Brand + Staff Engine Badge + Separator + Supabase Status */}
          <div className="flex items-center gap-3.5 shrink-0">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <Image
                src="/brand/speco-logo.png"
                alt="SPECO"
                width={112}
                height={38}
                priority
                className={`h-8 w-auto object-contain transition-transform group-hover:scale-105 ${
                  isDark ? "brightness-0 invert" : ""
                }`}
              />
            </Link>

            {/* Staff Engine Badge */}
            <div className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase leading-tight border flex flex-col items-center justify-center shrink-0 ${
              isDark
                ? "bg-emerald-950/70 text-emerald-400 border-emerald-500/30"
                : "bg-emerald-100 text-emerald-800 border-emerald-200"
            }`}>
              <span>STAFF</span>
              <span>ENGINE</span>
            </div>

            {/* Vertical Separator */}
            <span className={`h-6 w-px shrink-0 ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />

            {/* Realtime Supabase Connection Status */}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono shrink-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Supabase Cloud Online
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className={`font-bold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                {laptops.length} Laptop Terverifikasi
              </span>
            </div>
          </div>

          {/* Right: Actions Group */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Theme Toggle Pill */}
            <button
              onClick={toggleTheme}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer shrink-0 shadow-2xs whitespace-nowrap ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              }`}
              title={isDark ? "Ganti ke Mode Terang (Light Mode)" : "Ganti ke Mode Gelap (Dark Mode)"}
            >
              {isDark ? <SunIcon className="w-4 h-4 text-amber-400 shrink-0" /> : <MoonIcon className="w-4 h-4 text-slate-600 shrink-0" />}
              <span className="font-semibold">{isDark ? "Terang" : "Gelap"}</span>
            </button>

            {/* Unified Data Actions Group: Impor Excel | Ekspor Excel | SQL */}
            <div className={`hidden sm:flex items-center rounded-xl border p-0.5 shadow-2xs shrink-0 transition-colors whitespace-nowrap ${
              isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  isDark ? "hover:bg-slate-800 text-slate-300 hover:text-white" : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                }`}
                title="Unggah berkas Excel untuk merge pembaruan data"
              >
                <UploadSimpleIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Impor Excel</span>
              </button>

              <span className={`h-4 w-px ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />

              <button
                onClick={handleExportXLSX}
                className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  isDark ? "hover:bg-slate-800 text-slate-300 hover:text-white" : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                }`}
                title="Ekspor seluruh dataset ke Excel (.xlsx)"
              >
                <DownloadSimpleIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Ekspor Excel</span>
              </button>

              <span className={`h-4 w-px ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />

              <button
                onClick={handleExportSQL}
                className={`h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  isDark ? "hover:bg-slate-800 text-slate-300 hover:text-white" : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                }`}
                title="Ekspor dump skema SQL"
              >
                <DatabaseIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>SQL</span>
              </button>
            </div>

            {/* Hidden Excel File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls"
              className="hidden"
            />

            {/* Tambah Perangkat Primary CTA */}
            <button
              onClick={handleAddNewClick}
              className="h-9 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/30 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <PlusIcon weight="bold" className="w-4 h-4 shrink-0" />
              <span>Tambah Perangkat</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogoutAdmin}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isDark
                  ? "bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border-slate-700"
                  : "bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border-slate-200 shadow-2xs"
              }`}
              title="Keluar dari Portal Staff"
            >
              <SignOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. BODY WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Status Toast Alert */}
        {statusMsg && (
          <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs ${
            isDark
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}>
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4-BENTO METRIC OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`rounded-3xl p-5 border shadow-xs transition-colors ${
            isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200/90"
          }`}>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Total Perangkat
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                {metrics.total}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">100% Aktif</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Sinkron dengan Database Supabase</span>
          </div>

          <div className={`rounded-3xl p-5 border shadow-xs transition-colors ${
            isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200/90"
          }`}>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Laptop Mahasiswa
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                {metrics.countLaptop}
              </span>
              <span className="text-xs text-slate-500">Unit</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Portabel untuk kuliah & lab</span>
          </div>

          <div className={`rounded-3xl p-5 border shadow-xs transition-colors ${
            isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200/90"
          }`}>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Mini PC & Desktop Ringkas
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-teal-700 dark:text-teal-400">
                {metrics.countMiniPc}
              </span>
              <span className="text-xs text-slate-500">Unit</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Dukungan desktop hemat ruang</span>
          </div>

          <div className={`rounded-3xl p-5 border shadow-xs transition-colors ${
            isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200/90"
          }`}>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Rata-Rata Harga Pasar
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-700 dark:text-amber-400">
                {formatRupiah(metrics.avgHarga)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">{metrics.countLokal} Model Brand Lokal</span>
          </div>
        </div>

        {/* AUDIT KUALITAS & KELENGKAPAN DATA (NULL DETECTOR) */}
        <div className={`p-5 rounded-3xl border shadow-xs transition-colors ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200/90"
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${
                metrics.missingImagesCount > 0
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-emerald-500/10 text-emerald-500"
              }`}>
                <WarningCircleIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-sm font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  Audit Kualitas & Kelengkapan Data Katalog
                </h4>
                <p className="text-xs text-slate-400">
                  Monitoring kelengkapan URL gambar dan field spesifikasi untuk {metrics.total} entitas laptop & desktop.
                </p>
              </div>
            </div>

            {/* Quick Export Button for Incomplete Data */}
            {metrics.missingImagesCount > 0 && (
              <button
                onClick={() => {
                  setCompletenessFilter("missing_image");
                  setCurrentPage(1);
                  setTimeout(() => handleExportXLSX(), 100);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDark
                    ? "bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/50"
                    : "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100"
                }`}
                title="Ekspor baris yang belum ada gambar ke Excel untuk diperbarui"
              >
                <DownloadSimpleIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Ekspor Data Butuh Gambar ({metrics.missingImagesCount})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1: Missing Image */}
            <div
              onClick={() => {
                setCompletenessFilter(completenessFilter === "missing_image" ? "all" : "missing_image");
                setCurrentPage(1);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                completenessFilter === "missing_image"
                  ? "ring-2 ring-amber-500 bg-amber-500/10 border-amber-500/30"
                  : isDark
                    ? "bg-slate-950/60 border-slate-800 hover:border-amber-500/40"
                    : "bg-slate-50 border-slate-200 hover:border-amber-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider font-mono">
                  Belum Ada URL Gambar
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {Math.round((metrics.missingImagesCount / (metrics.total || 1)) * 100)}%
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {metrics.missingImagesCount}
                </span>
                <span className="text-xs text-slate-400 font-medium">dari {metrics.total} unit</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {completenessFilter === "missing_image" ? "✓ Sedang memfilter tabel" : "Klik untuk memfilter tabel"}
              </p>
            </div>

            {/* Card 2: Incomplete Data */}
            <div
              onClick={() => {
                setCompletenessFilter(completenessFilter === "incomplete" ? "all" : "incomplete");
                setCurrentPage(1);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                completenessFilter === "incomplete"
                  ? "ring-2 ring-rose-500 bg-rose-500/10 border-rose-500/30"
                  : isDark
                    ? "bg-slate-950/60 border-slate-800 hover:border-rose-500/40"
                    : "bg-slate-50 border-slate-200 hover:border-rose-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider font-mono">
                  Data Belum Lengkap (Ada Null)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  Perlu Dilengkapi
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {metrics.incompleteCount}
                </span>
                <span className="text-xs text-slate-400 font-medium">unit perlu review</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {completenessFilter === "incomplete" ? "✓ Sedang memfilter tabel" : "Klik untuk memfilter kolom kosong"}
              </p>
            </div>

            {/* Card 3: Complete Verified */}
            <div
              onClick={() => {
                setCompletenessFilter(completenessFilter === "complete" ? "all" : "complete");
                setCurrentPage(1);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                completenessFilter === "complete"
                  ? "ring-2 ring-emerald-500 bg-emerald-500/10 border-emerald-500/30"
                  : isDark
                    ? "bg-slate-950/60 border-slate-800 hover:border-emerald-500/40"
                    : "bg-slate-50 border-slate-200 hover:border-emerald-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
                  100% Terverifikasi Lengkap
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Siap Rilis
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {metrics.completeCount}
                </span>
                <span className="text-xs text-slate-400 font-medium">dari {metrics.total} unit</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {completenessFilter === "complete" ? "✓ Sedang memfilter tabel" : "Klik untuk menampilkan data lengkap"}
              </p>
            </div>
          </div>
        </div>

        {/* 3. ADVANCED SEARCH & FILTER CONTROLS */}
        <div className={`rounded-3xl p-5 border shadow-xs space-y-4 transition-colors ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200/90"
        }`}>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Type Filter Pills */}
            <div className={`flex items-center gap-1.5 p-1 rounded-2xl border self-start ${
              isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
            }`}>
              <button
                type="button"
                onClick={() => { setTypeFilter("all"); setCurrentPage(1); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === "all"
                    ? isDark ? "bg-slate-800 text-white shadow-xs" : "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Semua ({laptops.length})
              </button>
              <button
                type="button"
                onClick={() => { setTypeFilter("laptop"); setCurrentPage(1); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  typeFilter === "laptop"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <LaptopIcon className="w-4 h-4" />
                <span>Laptop ({metrics.countLaptop})</span>
              </button>
              <button
                type="button"
                onClick={() => { setTypeFilter("minipc"); setCurrentPage(1); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  typeFilter === "minipc"
                    ? "bg-teal-700 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <DesktopIcon className="w-4 h-4" />
                <span>Mini PC ({metrics.countMiniPc})</span>
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Cari ID, seri, CPU, GPU, target jurusan..."
                className={`w-full h-11 px-4 pl-10 rounded-2xl border text-xs outline-none transition-colors ${
                  isDark
                    ? "bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white"
                }`}
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status Kelengkapan Data Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Status Data:</span>
            <button
              type="button"
              onClick={() => { setCompletenessFilter("all"); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                completenessFilter === "all"
                  ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                  : isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Semua ({metrics.total})
            </button>
            <button
              type="button"
              onClick={() => { setCompletenessFilter("missing_image"); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                completenessFilter === "missing_image"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : isDark ? "bg-amber-950/40 text-amber-300 border border-amber-800/50 hover:bg-amber-900/50" : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <WarningCircleIcon className="w-3.5 h-3.5" />
              <span>Gambar Belum Ada ({metrics.missingImagesCount})</span>
            </button>
            <button
              type="button"
              onClick={() => { setCompletenessFilter("incomplete"); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                completenessFilter === "incomplete"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : isDark ? "bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/50" : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
              }`}
            >
              <WarningCircleIcon className="w-3.5 h-3.5" />
              <span>Data Belum Lengkap ({metrics.incompleteCount})</span>
            </button>
            <button
              type="button"
              onClick={() => { setCompletenessFilter("complete"); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                completenessFilter === "complete"
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : isDark ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/50" : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <CheckCircleIcon className="w-3.5 h-3.5" />
              <span>Lengkap 100% ({metrics.completeCount})</span>
            </button>
          </div>

          {/* Secondary Filters Bar */}
          <div className={`flex flex-wrap items-center gap-2 pt-3 border-t text-xs ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}>
            {/* Brand Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Brand:</span>
              <button
                type="button"
                onClick={() => { setBrandFilter("all"); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  brandFilter === "all"
                    ? "bg-emerald-700 text-white"
                    : isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Semua Brand
              </button>
              {["Axioo", "Advan", "Zyrex", "ASUS", "Lenovo", "Acer", "Apple", "MSI", "HP", "Dell"].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => { setBrandFilter(b); setCurrentPage(1); }}
                  className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                    brandFilter.toLowerCase() === b.toLowerCase()
                      ? "bg-emerald-700 text-white"
                      : isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <BrandIcon brand={b} useBrandColor className="w-3.5 h-3.5" />
                  <span>{b}</span>
                </button>
              ))}
            </div>

            {/* Jurusan Target & Sorting Dropdown */}
            <div className="ml-auto flex items-center gap-2">
              <select
                value={jurusanFilter}
                onChange={(e) => { setJurusanFilter(e.target.value); setCurrentPage(1); }}
                className={`h-9 px-3 rounded-xl border text-xs outline-none ${
                  isDark ? "bg-slate-950 border-slate-700 text-slate-300" : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <option value="all">Semua Jurusan</option>
                <option value="Informatika">Informatika / Sains Data</option>
                <option value="Desain">Desain DKV / Animasi</option>
                <option value="Teknik">Teknik Mesin / Elektro</option>
                <option value="Bisnis">Ekonomi / Bisnis</option>
                <option value="Non-Teknik">Non-Teknik / Umum</option>
              </select>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
                className={`h-9 px-3 rounded-xl border text-xs outline-none ${
                  isDark ? "bg-slate-950 border-slate-700 text-slate-300" : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <option value="default">Urutkan: Default ID</option>
                <option value="price-asc">Harga Termurah</option>
                <option value="price-desc">Harga Tertinggi</option>
                <option value="ram-desc">RAM Terbesar</option>
                <option value="weight-asc">Bobot Teringan</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. REALTIME DATA TABLE WITH STICKY FIRST COLUMN & MOUSE DRAG SCROLL */}
        <div className={`rounded-3xl border overflow-hidden shadow-lg transition-colors ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200/90"
        }`}>
          <div
            ref={tableContainerRef}
            onMouseDown={handleTableMouseDown}
            onMouseLeave={handleTableMouseLeave}
            onMouseUp={handleTableMouseUp}
            onMouseMove={handleTableMouseMove}
            className={`overflow-x-auto relative transition-all ${
              isDraggingTable ? "cursor-grabbing select-none" : "cursor-grab"
            }`}
            title="Klik & tahan mouse untuk menggeser tabel (drag-to-scroll)"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead className={`border-b text-[10px] uppercase font-mono tracking-wider ${
                isDark ? "bg-slate-950 text-slate-400 border-slate-800" : "bg-slate-50 text-slate-600 border-slate-200"
              }`}>
                <tr>
                  {/* Pinned Sticky First Column */}
                  <th className={`py-4 px-4 sticky left-0 z-20 min-w-[280px] sm:min-w-[320px] shadow-[2px_0_5px_rgba(0,0,0,0.04)] ${
                    isDark ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900 font-extrabold"
                  }`}>
                    Perangkat & Model
                  </th>
                  <th className="py-4 px-4 min-w-[150px]">Target Jurusan</th>
                  <th className="py-4 px-4 min-w-[180px]">Processor & GPU</th>
                  <th className="py-4 px-3 min-w-[100px]">RAM</th>
                  <th className="py-4 px-3 min-w-[140px]">Storage</th>
                  <th className="py-4 px-3 min-w-[140px]">Layar & Bobot</th>
                  <th className="py-4 px-4 min-w-[150px] font-bold text-emerald-700 dark:text-emerald-400">
                    Harga Pasar (Realtime)
                  </th>
                  <th className="py-4 px-3 min-w-[130px]">Garansi</th>
                  <th className="py-4 px-4 text-right min-w-[110px]">Aksi Staff</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDark ? "divide-slate-800 text-slate-300" : "divide-slate-200/80 text-slate-700"
              }`}>
                {paginatedLaptops.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400 font-mono">
                      Tidak ada perangkat yang cocok dengan kriteria filter pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedLaptops.map((l, index) => {
                    const isInline = inlineEditingId === l.ID_Perangkat;
                    const isSaving = savingInlineId === l.ID_Perangkat;
                    const isOdd = index % 2 === 1;

                    return (
                      <tr
                        key={l.ID_Perangkat}
                        className={`transition-colors ${
                          isInline
                            ? isDark ? "bg-slate-800" : "bg-emerald-50/70"
                            : isDark
                            ? isOdd ? "bg-slate-900/60 hover:bg-slate-800/50" : "hover:bg-slate-800/50"
                            : isOdd ? "bg-slate-50/50 hover:bg-slate-100/70" : "hover:bg-slate-100/70"
                        }`}
                      >
                        {/* Pinned Sticky First Column */}
                        <td className={`py-3.5 px-4 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)] ${
                          isInline
                            ? isDark ? "bg-slate-800" : "bg-emerald-50"
                            : isDark
                            ? isOdd ? "bg-slate-900" : "bg-slate-900/95"
                            : isOdd ? "bg-slate-50" : "bg-white"
                        }`}>
                          <div className="flex items-center gap-3">
                            {/* Device Image / Brand Logo Emblem */}
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border overflow-hidden ${
                              isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
                            }`}>
                              {l.Link_Gambar ? (
                                <img
                                  src={l.Link_Gambar}
                                  alt={l.Model_Seri}
                                  className="w-full h-full object-contain p-1"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <BrandIcon brand={l.Brand} useBrandColor className="w-5 h-5" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`font-black text-xs truncate max-w-[200px] ${
                                  isDark ? "text-white" : "text-slate-900"
                                }`}>
                                  {l.Model_Seri}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {l.ID_Perangkat}
                                </span>
                                <span className="text-[11px] font-bold text-slate-500">
                                  {l.Brand}
                                </span>
                                {(!l.Link_Gambar || !l.Link_Gambar.trim()) && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 flex items-center gap-0.5">
                                    <WarningCircleIcon className="w-2.5 h-2.5" />
                                    <span>Butuh Gambar</span>
                                  </span>
                                )}
                                {(l.Tipe_Perangkat || "").toLowerCase().includes("mini") && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30">
                                    Mini PC
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Target Jurusan */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold block w-fit truncate max-w-[150px] ${
                            isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-800 border border-slate-200"
                          }`}>
                            {l.Target_Mahasiswa_Jurusan || "Semua Jurusan"}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {l.Kategori_Target || "Katalog Umum"}
                          </span>
                        </td>

                        {/* CPU & GPU */}
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <span className={`block truncate max-w-[180px] font-semibold ${
                            isDark ? "text-slate-200" : "text-slate-900"
                          }`} title={l.Processor_CPU}>
                            {l.Processor_CPU}
                          </span>
                          <span className="text-slate-400 block truncate max-w-[180px]" title={l.Kartu_Grafis_GPU}>
                            {l.Kartu_Grafis_GPU}
                          </span>
                        </td>

                        {/* RAM */}
                        <td className="py-3.5 px-3">
                          {isInline ? (
                            <input
                              type="number"
                              value={inlineValues.ram}
                              onChange={(e) => setInlineValues({ ...inlineValues, ram: e.target.value })}
                              className={`w-16 h-8 px-2 rounded-lg border text-xs font-mono font-bold outline-none ${
                                isDark ? "bg-slate-950 border-emerald-500 text-white" : "bg-white border-emerald-600 text-slate-900"
                              }`}
                            />
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className={`font-black text-xs ${isDark ? "text-white" : "text-slate-900"}`}>
                                {l.RAM_GB} GB
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                String(l.Upgradeable_RAM).toLowerCase() === "ya"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                              }`}>
                                {String(l.Upgradeable_RAM).toLowerCase() === "ya" ? "Upgr" : "Sold"}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Storage */}
                        <td className="py-3.5 px-3 text-[11px]">
                          {isInline ? (
                            <input
                              type="text"
                              value={inlineValues.storage}
                              onChange={(e) => setInlineValues({ ...inlineValues, storage: e.target.value })}
                              className={`w-28 h-8 px-2 rounded-lg border text-xs outline-none ${
                                isDark ? "bg-slate-950 border-emerald-500 text-white" : "bg-white border-emerald-600 text-slate-900"
                              }`}
                            />
                          ) : (
                            <span className="truncate block max-w-[130px] font-medium" title={l.Storage_GB_Tipe}>
                              {l.Storage_GB_Tipe}
                            </span>
                          )}
                        </td>

                        {/* Layar & Bobot */}
                        <td className="py-3.5 px-3 text-[11px]">
                          <span className={`truncate block max-w-[130px] font-medium ${
                            isDark ? "text-slate-300" : "text-slate-800"
                          }`} title={l.Layar_Ukuran_Panel_ColorGamut}>
                            {l.Layar_Ukuran_Panel_ColorGamut}
                          </span>
                          <span className="text-slate-400 block mt-0.5 font-mono text-[10px]">
                            {l.Bobot_kg} kg
                          </span>
                        </td>

                        {/* Harga Pasar (Realtime Inline Edit) */}
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {isInline ? (
                            <input
                              type="number"
                              value={inlineValues.price}
                              onChange={(e) => setInlineValues({ ...inlineValues, price: e.target.value })}
                              className={`w-28 h-8 px-2 rounded-lg border text-xs font-mono font-bold outline-none ${
                                isDark ? "bg-slate-950 border-emerald-500 text-emerald-400" : "bg-white border-emerald-600 text-emerald-800"
                              }`}
                            />
                          ) : (
                            <button
                              onClick={() => handleStartInlineEdit(l)}
                              className="text-emerald-700 dark:text-emerald-400 hover:underline font-black text-xs text-left"
                              title="Klik untuk edit harga cepat"
                            >
                              {formatRupiah(Number(l.Estimasi_Harga_Pasar_IDR) || 0)}
                            </button>
                          )}
                        </td>

                        {/* Garansi */}
                        <td className="py-3.5 px-3 text-[11px]">
                          {isInline ? (
                            <input
                              type="text"
                              value={inlineValues.warranty}
                              onChange={(e) => setInlineValues({ ...inlineValues, warranty: e.target.value })}
                              className={`w-24 h-8 px-2 rounded-lg border text-xs outline-none ${
                                isDark ? "bg-slate-950 border-emerald-500 text-white" : "bg-white border-emerald-600 text-slate-900"
                              }`}
                            />
                          ) : (
                            <span className="truncate block max-w-[110px] text-slate-500" title={l.Status_Garansi_Resmi}>
                              {l.Status_Garansi_Resmi}
                            </span>
                          )}
                        </td>

                        {/* Aksi Staff */}
                        <td className="py-3.5 px-4 text-right">
                          {isInline ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveInlineEdit(l.ID_Perangkat)}
                                disabled={isSaving}
                                className="p-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                                title="Simpan Perubahan Inline"
                              >
                                {isSaving ? (
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <CheckIcon weight="bold" className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={handleCancelInlineEdit}
                                className={`p-1.5 rounded-lg cursor-pointer ${
                                  isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                }`}
                                title="Batal"
                              >
                                <XIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditClick(l)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                                  isDark
                                    ? "bg-slate-800 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/40"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200"
                                }`}
                                title="Edit Spesifikasi Lengkap Perangkat (20 Field)"
                              >
                                <PencilSimpleIcon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(l.ID_Perangkat)}
                                className={`p-1.5 rounded-xl transition-colors cursor-pointer border ${
                                  isDark
                                    ? "bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border-slate-700/80"
                                    : "bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border-slate-200 shadow-2xs"
                                }`}
                                title="Hapus Perangkat"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-colors ${
            isDark ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
          }`}>
            <div className="flex items-center gap-2">
              <span>Menampilkan {filteredLaptops.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredLaptops.length)} dari {filteredLaptops.length} perangkat</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span>Baris per halaman:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className={`h-7 px-2 rounded-lg border text-xs outline-none ${
                  isDark ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
                  isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Sebelumnya
              </button>
              <span className={`px-2 font-mono font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
                  isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Berikutnya
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ==============================================================================
          5. MODAL FORM TAMBAH / EDIT LENGKAP (ALL 20 DATASET FIELDS) - DUAL THEME
      ============================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className={`border rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl transition-colors overflow-hidden ${
            isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            {/* Modal Header: Sticky Top with ID Badge & Close Button */}
            <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
              isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold border shrink-0 ${
                  isDark ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-emerald-100 text-emerald-800 border-emerald-200"
                }`}>
                  <DatabaseIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-black leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    {editingLaptop ? "Perbarui Data Spesifikasi Perangkat" : "Tambah Perangkat Baru ke Dataset"}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    ID Perangkat: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{formData.ID_Perangkat}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
                title="Tutup Modal"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form with Scrollable Content Body */}
            <form onSubmit={handleSubmitForm} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Row 1: Brand & Device Type & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Brand Resmi</label>
                  <select
                    value={formData.Brand}
                    onChange={(e) => setFormData({ ...formData, Brand: e.target.value })}
                    className={`w-full h-10 px-3 rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    {["Advan", "Axioo", "Zyrex", "ASUS", "Lenovo", "Acer", "Apple", "MSI", "HP", "Dell"].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Tipe Perangkat</label>
                  <select
                    value={formData.Tipe_Perangkat}
                    onChange={(e) => setFormData({ ...formData, Tipe_Perangkat: e.target.value })}
                    className={`w-full h-10 px-3 rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Mini PC">Mini PC / Desktop Ringkas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Kategori Target</label>
                  <select
                    value={formData.Kategori_Target}
                    onChange={(e) => setFormData({ ...formData, Kategori_Target: e.target.value })}
                    className={`w-full h-10 px-3 rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="Teknik/Informatika">Teknik/Informatika</option>
                    <option value="Multimedia/Desain">Multimedia/Desain</option>
                    <option value="Dasar/Pelajar">Dasar/Pelajar</option>
                    <option value="Bisnis/Produktivitas">Bisnis/Produktivitas</option>
                    <option value="Gaming/Komputasi Berat">Gaming/Komputasi Berat</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Model & Target Mahasiswa Jurusan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Model / Nama Seri Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.Model_Seri}
                    onChange={(e) => setFormData({ ...formData, Model_Seri: e.target.value })}
                    placeholder="Contoh: Workplus AMD Ryzen 5 6600H"
                    className={`w-full h-10 px-3 rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Target Mahasiswa Jurusan</label>
                  <input
                    type="text"
                    required
                    value={formData.Target_Mahasiswa_Jurusan}
                    onChange={(e) => setFormData({ ...formData, Target_Mahasiswa_Jurusan: e.target.value })}
                    placeholder="Contoh: Informatika / Sains Data"
                    className={`w-full h-10 px-3 rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Row 3: CPU & GPU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Processor / CPU</label>
                  <input
                    type="text"
                    required
                    value={formData.Processor_CPU}
                    onChange={(e) => setFormData({ ...formData, Processor_CPU: e.target.value })}
                    placeholder="Contoh: AMD Ryzen 7 7730U"
                    className={`w-full h-10 px-3 rounded-xl border font-mono outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Kartu Grafis / GPU</label>
                  <input
                    type="text"
                    required
                    value={formData.Kartu_Grafis_GPU}
                    onChange={(e) => setFormData({ ...formData, Kartu_Grafis_GPU: e.target.value })}
                    placeholder="Contoh: AMD Radeon Graphics / RTX 4050"
                    className={`w-full h-10 px-3 rounded-xl border font-mono outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Row 4: RAM, Upgradeable, Bobot */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">RAM (GB)</label>
                  <input
                    type="number"
                    required
                    value={formData.RAM_GB}
                    onChange={(e) => setFormData({ ...formData, RAM_GB: e.target.value })}
                    className={`w-full h-10 px-3 rounded-xl border font-mono outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">RAM Upgradable</label>
                  <select
                    value={formData.Upgradeable_RAM}
                    onChange={(e) => setFormData({ ...formData, Upgradeable_RAM: e.target.value })}
                    className={`w-full h-10 px-3 rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="Ya">Ya (Slot SODIMM Tersedia)</option>
                    <option value="Tidak">Tidak (Soldered Onboard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Bobot (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.Bobot_kg}
                    onChange={(e) => setFormData({ ...formData, Bobot_kg: e.target.value })}
                    className={`w-full h-10 px-3 rounded-xl border font-mono outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Row 5: Storage & Layar Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Storage Kapasitas & Tipe</label>
                  <input
                    type="text"
                    required
                    value={formData.Storage_GB_Tipe}
                    onChange={(e) => setFormData({ ...formData, Storage_GB_Tipe: e.target.value })}
                    placeholder="Contoh: 512GB SSD NVMe PCIe 4.0"
                    className={`w-full h-10 px-3 rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Layar & Panel</label>
                  <input
                    type="text"
                    required
                    value={formData.Layar_Ukuran_Panel_ColorGamut}
                    onChange={(e) => setFormData({ ...formData, Layar_Ukuran_Panel_ColorGamut: e.target.value })}
                    placeholder="Contoh: 14 inci IPS FHD 100% sRGB"
                    className={`w-full h-10 px-3 rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Row 6: Harga Pasar, Platform Beli, Garansi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Estimasi Harga (IDR)</label>
                  <input
                    type="number"
                    required
                    value={formData.Estimasi_Harga_Pasar_IDR}
                    onChange={(e) => setFormData({ ...formData, Estimasi_Harga_Pasar_IDR: e.target.value })}
                    placeholder="7000000"
                    className={`w-full h-10 px-3 rounded-xl border font-mono font-black outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-emerald-400" : "bg-slate-50 border-slate-300 text-emerald-800"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Platform Rekomendasi Beli</label>
                  <input
                    type="text"
                    value={formData.Platform_Rekomendasi_Beli}
                    onChange={(e) => setFormData({ ...formData, Platform_Rekomendasi_Beli: e.target.value })}
                    placeholder="Tokopedia Official Store"
                    className={`w-full h-10 px-3 rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Garansi Resmi</label>
                  <input
                    type="text"
                    required
                    value={formData.Status_Garansi_Resmi}
                    onChange={(e) => setFormData({ ...formData, Status_Garansi_Resmi: e.target.value })}
                    placeholder="1 Tahun Resmi Indonesia"
                    className={`w-full h-10 px-3 rounded-xl border outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Row 7: Tags & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Rekomendasi UseCase Tag</label>
                  <input
                    type="text"
                    value={formData.Rekomendasi_UseCase_Tag}
                    onChange={(e) => setFormData({ ...formData, Rekomendasi_UseCase_Tag: e.target.value })}
                    placeholder="#skripsi-browsing #office #coding"
                    className={`w-full h-10 px-3 rounded-xl border font-mono outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-500 font-bold">URL Gambar Perangkat</label>
                    <div className="flex items-center gap-2">
                      {formData.Link_Gambar && (
                        <a
                          href={formData.Link_Gambar}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                        >
                          <ArrowSquareOutIcon className="w-3.5 h-3.5" />
                          <span>Tes Link</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowImagePreview(!showImagePreview)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                          showImagePreview
                            ? isDark
                              ? "bg-emerald-950/60 border-emerald-700 text-emerald-300"
                              : "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : isDark
                              ? "bg-slate-800 border-slate-700 text-slate-400"
                              : "bg-slate-100 border-slate-300 text-slate-600"
                        }`}
                      >
                        <EyeIcon className="w-3 h-3" />
                        <span>{showImagePreview ? "Sembunyikan" : "Preview"}</span>
                      </button>
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="url"
                      value={formData.Link_Gambar}
                      onChange={(e) => {
                        setFormData({ ...formData, Link_Gambar: e.target.value });
                        setPreviewError(false);
                      }}
                      placeholder="https://images.tokopedia.net/..."
                      className={`w-full h-10 pl-3 pr-24 rounded-xl border outline-none font-mono text-xs ${
                        isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowImagePreview(true);
                        setPreviewError(false);
                      }}
                      className={`absolute right-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                        isDark ? "bg-slate-800 hover:bg-slate-700 text-emerald-400" : "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Image Preview Card */}
              {showImagePreview && formData.Link_Gambar.trim() && (
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className={`w-4 h-4 ${previewError ? "text-rose-500" : "text-emerald-500"}`} />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Live Preview Gambar
                      </span>
                    </div>
                    {previewError ? (
                      <span className="text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        Gambar Gagal Dimuat
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        URL Gambar Valid
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className={`relative w-36 h-28 shrink-0 rounded-xl overflow-hidden border flex items-center justify-center p-2 shadow-inner ${
                      isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.Link_Gambar}
                        alt="Preview Laptop"
                        onError={() => setPreviewError(true)}
                        onLoad={() => setPreviewError(false)}
                        className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${
                          previewError ? "hidden" : "block"
                        }`}
                      />
                      {previewError && (
                        <div className="text-center p-2 text-rose-500 flex flex-col items-center">
                          <XIcon className="w-6 h-6 mb-1 text-rose-500" />
                          <span className="text-[10px] font-bold leading-tight">Gagal memuat gambar</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-xs min-w-0">
                      <p className={`font-bold mb-1 truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                        {formData.Brand} {formData.Model_Seri || "Nama Model"}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono break-all line-clamp-2 mb-2">
                        {formData.Link_Gambar}
                      </p>
                      {previewError ? (
                        <p className="text-[11px] text-rose-500 font-medium">
                          Pastikan URL dapat diakses secara publik (Direct Image URL dari CDN / Tokopedia / Shopee / Unsplash).
                        </p>
                      ) : (
                        <p className="text-[11px] text-emerald-600 font-medium">
                          Gambar terverifikasi dan siap ditampilkan pada katalog rekomendasi serta dashboard mahasiswa.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Row 8: Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Kelebihan (Pros)</label>
                  <textarea
                    rows={2}
                    value={formData.Pros_Kelebihan}
                    onChange={(e) => setFormData({ ...formData, Pros_Kelebihan: e.target.value })}
                    placeholder="Kinerja prosesor kencang, layar tajam, bodi aluminium"
                    className={`w-full p-2.5 rounded-xl border outline-none resize-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Kekurangan (Cons)</label>
                  <textarea
                    rows={2}
                    value={formData.Cons_Kekurangan}
                    onChange={(e) => setFormData({ ...formData, Cons_Kekurangan: e.target.value })}
                    placeholder="RAM disolder, webcam standar 720p"
                    className={`w-full p-2.5 rounded-xl border outline-none resize-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Modal Action Buttons: Sticky Bottom */}
            <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 shrink-0 ${
              isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-slate-50"
            }`}>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-200/80 hover:bg-slate-200 text-slate-700"
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-700/20 transition-colors"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Simpan ke Database Supabase</span>
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* ==============================================================================
          6. MODAL IMPOR & MERGE DATASET EXCEL (.xlsx)
      ============================================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className={`border rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl transition-colors overflow-hidden ${
            isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
              isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold border shrink-0 ${
                  isDark ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-emerald-100 text-emerald-800 border-emerald-200"
                }`}>
                  <UploadSimpleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-black leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    Pratinjau Impor & Merge Dataset Excel
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Berkas: <span className="font-bold text-emerald-600 dark:text-emerald-400">{importFileName}</span> • Ditemukan{" "}
                    <span className="font-bold text-amber-500">{importMergeList.length}</span> perangkat dengan nilai baru untuk di-merge
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
                title="Tutup Modal"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Preview Table */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className={`p-4 rounded-2xl border ${
                isDark ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-900"
              }`}>
                <p className="font-semibold text-xs leading-relaxed">
                  💡 <strong>Kebijakan Merge Pintar:</strong> Sistem hanya memperbarui kolom di database Supabase yang memiliki nilai baru di berkas Excel Anda. Kolom yang kosong atau tidak diubah di Excel <strong>tidak akan menimpa</strong> data lama yang sudah tersimpan.
                </p>
              </div>

              <div className={`rounded-2xl border overflow-hidden ${
                isDark ? "border-slate-800 bg-slate-950/60" : "border-slate-200 bg-slate-50/60"
              }`}>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b ${isDark ? "border-slate-800 bg-slate-900 text-slate-400" : "border-slate-200 bg-white text-slate-600"}`}>
                        <th className="py-2.5 px-3 font-mono font-bold">ID</th>
                        <th className="py-2.5 px-3 font-bold">Perangkat / Model</th>
                        <th className="py-2.5 px-3 font-bold">Kolom yang Diperbarui</th>
                        <th className="py-2.5 px-3 font-bold">Perubahan Nilai (Lama → Baru)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                      {importMergeList.map((item) => (
                        <tr key={item.id} className={isDark ? "hover:bg-slate-900/60" : "hover:bg-white"}>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            {item.id}
                          </td>
                          <td className="py-2.5 px-3 font-medium whitespace-nowrap">
                            <span className="font-bold block">{item.model}</span>
                            <span className="text-[11px] text-slate-400">{item.brand}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap gap-1">
                              {item.changes.map((c, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 whitespace-nowrap">
                                  {c.field}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 max-w-sm">
                            <div className="space-y-1">
                              {item.changes.map((c, i) => (
                                <div key={i} className="text-[11px] truncate font-mono">
                                  <span className="text-slate-400">{c.oldVal}</span>
                                  <span className="text-emerald-500 font-bold mx-1">→</span>
                                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold">{c.newVal}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className={`px-6 py-4 border-t flex items-center justify-between shrink-0 ${
              isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-slate-50"
            }`}>
              <span className="text-xs text-slate-400">
                Total <strong className="text-emerald-600 dark:text-emerald-400">{importMergeList.length}</strong> perangkat siap di-merge ke Supabase
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  disabled={isMerging}
                  className={`px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-200/80 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteMerge}
                  disabled={isMerging}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-700/20 transition-colors"
                >
                  {isMerging && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{isMerging ? "Sedang Memperbarui Database..." : "Konfirmasi & Terapkan Merge"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
