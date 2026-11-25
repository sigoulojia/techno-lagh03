import { useState, useMemo } from 'react';
import {
  ArrowRight,
  ShoppingBag,
  Search,
  Sparkles,
  FolderOpen,
  Feather,
  Briefcase,
  Compass,
  BookOpen,
  Clock,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  MapPin,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import type { Product, StoreCategory } from '../data/products';
import { STORE_INFO } from '../data/products';
import {
  formatDzd,
  filterAndSortProducts,
  getProductCategoryLabel,
} from '../utils/storeLogic';
import { TechnoLogo } from './TechnoLogo';
import { ProductCard } from './ProductCard';

interface CategoryDetailPageProps {
  categoryId: string;
  categoryName?: string;
  allProducts: Product[];
  allCategories: StoreCategory[];
  cartCount: number;
  onBackToHome: () => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onOpenCart: () => void;
}

// Department metadata & visual themes
const DEPARTMENT_METADATA: Record<
  string,
  {
    title: string;
    description: string;
    icon: any;
    tag: string;
    badgeBg: string;
    accentBorder: string;
  }
> = {
  office: {
    title: 'قسم الأدوات المكتبية والسجلات',
    description: 'ملفات، سجلات محاسبية معتمدة، وأدوات تنظيم المكاتب الفاخرة المعتمدة لدى المؤسسات.',
    icon: FolderOpen,
    tag: 'مكتبي ومؤسسي',
    badgeBg: 'bg-[#FFD100] text-[#18181B]',
    accentBorder: 'border-[#FFD100]',
  },
  pens: {
    title: 'قسم أقلام التوقيع والفاخرة',
    description: 'أقلام حبر سائل، رولر تنفيذي، أقلام الخط العربي ومستلزمات الكتابة الراقية من كبرى الماركات.',
    icon: Feather,
    tag: 'كتابة راقية',
    badgeBg: 'bg-[#E30613] text-white',
    accentBorder: 'border-[#E30613]',
  },
  bags: {
    title: 'قسم حقائب الحواسيب والمهن (PROBAG)',
    description: 'حقائب أعمال متينة للأجهزة المحمولة والوثائق بمقاسات متعددة مبطنة ومقاومة للصدمات.',
    icon: Briefcase,
    tag: 'حماية وأناقة',
    badgeBg: 'bg-[#18181B] text-[#FFD100]',
    accentBorder: 'border-[#18181B]',
  },
  arts: {
    title: 'قسم مستلزمات الهندسة والفنون',
    description: 'أدوات رسم تقني دقيقة، مساطر معمارية، ألوان فنية وأوراق رسم متخصصة للمبدعين.',
    icon: Compass,
    tag: 'هندسة وإبداع',
    badgeBg: 'bg-amber-500 text-white',
    accentBorder: 'border-amber-500',
  },
  school: {
    title: 'قسم اللوازم المدرسية والجامعية',
    description: 'دفاتر تكنو فائقة الجودة والنعومة، أطقم هندسية متكاملة ومستلزمات الدراسة والامتحانات.',
    icon: BookOpen,
    tag: 'دراسة وتفوق',
    badgeBg: 'bg-blue-600 text-white',
    accentBorder: 'border-blue-600',
  },
  clocks: {
    title: 'قسم الساعات المكتبية والآلات الحاسبة',
    description: 'ساعات حائطية ومكتبية صامتة، آلات حاسبة علمية ومكتبية معتمدة للامتحانات والشركات.',
    icon: Clock,
    tag: 'تنظيم الوقت',
    badgeBg: 'bg-emerald-600 text-white',
    accentBorder: 'border-emerald-600',
  },
};

export function CategoryDetailPage({
  categoryId,
  categoryName,
  allProducts,
  allCategories,
  cartCount,
  onBackToHome,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
  onOpenCart,
}: CategoryDetailPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Resolve department metadata
  const meta =
    DEPARTMENT_METADATA[categoryId] || {
      title: categoryName ? `قسم ${categoryName}` : `قسم ${categoryId}`,
      description: `تشكيلة كاملة من منتجات ومستلزمات فرع تكنو الأغواط 03 مع التوصيل لجميع الولايات والدفع عند الاستلام.`,
      icon: Layers,
      tag: 'تشكيلة متوفرة',
      badgeBg: 'bg-[#18181B] text-[#FFD100]',
      accentBorder: 'border-[#18181B]',
    };

  const IconComponent = meta.icon;

  // Filter products for this specific category
  const categoryProducts = useMemo(() => {
    return filterAndSortProducts(allProducts, {
      series: categoryId,
      color: 'all',
      query: searchQuery,
      sort: sortOption,
    });
  }, [allProducts, categoryId, searchQuery, sortOption]);

  // Other departments for quick switching
  const otherDepartments = useMemo(() => {
    const defaultKeys = Object.keys(DEPARTMENT_METADATA);
    return defaultKeys
      .filter((k) => k !== categoryId)
      .map((k) => ({
        id: k,
        title: DEPARTMENT_METADATA[k].title,
        icon: DEPARTMENT_METADATA[k].icon,
        tag: DEPARTMENT_METADATA[k].tag,
      }));
  }, [categoryId]);

  return (
    <div className="min-h-screen flex flex-col bg-lined-paper text-[#18181B]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/98 backdrop-blur-xl border-b-4 border-[#FFD100] shadow-xs py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              aria-label="العودة إلى الصفحة الرئيسية للمتجر"
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[42px] rounded-xl border-2 border-[#18181B] bg-white hover:bg-[#FFD100] text-xs font-black text-[#18181B] transition-colors shadow-[2px_2px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 text-[#E30613]" aria-hidden="true" />
              <span>العودة للمتجر الرئيسي</span>
            </button>
            <div className="hidden sm:block">
              <TechnoLogo size="sm" showBranch={true} />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenCart}
              data-testid="category-cart-button"
              className="relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 min-h-[42px] rounded-xl bg-[#E30613] hover:bg-[#C4000F] text-white text-xs sm:text-sm font-black border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">سلة الطلب</span>
              <span className="bg-[#FFD100] text-[#18181B] border border-[#18181B] px-2 py-0.5 rounded-md text-xs font-mono font-black tabular-nums">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="مسار التصفح"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 text-xs text-[#71717A] flex items-center gap-2 flex-wrap"
      >
        <button
          type="button"
          onClick={onBackToHome}
          className="hover:text-[#18181B] hover:underline cursor-pointer"
        >
          الرئيسية
        </button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          onClick={onBackToHome}
          className="hover:text-[#18181B] hover:underline cursor-pointer"
        >
          أقسام المتجر
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-[#18181B] font-bold">{meta.title}</span>
      </nav>

      {/* Main Department Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex-1 space-y-8">
        {/* Department Hero Banner */}
        <div className={`p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#18181B] shadow-[6px_6px_0px_#18181B] relative overflow-hidden`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border border-[#18181B] shadow-[2px_2px_0px_#18181B] ${meta.badgeBg}`}>
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{meta.tag}</span>
                </span>
                <span className="stamp-yellow text-[11px] font-black">فرع الأغواط 03</span>
                <span className="stamp-red text-[11px] font-black">أصلي معتمد</span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-black text-[#18181B] leading-tight">
                {meta.title}
              </h1>

              <p className="text-sm sm:text-base text-stone-600 font-medium leading-relaxed">
                {meta.description}
              </p>

              {/* Department Highlights */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-stone-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>متوفر للشراء الفوري</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#E30613]" />
                  <span>توصيل لكافة الولايات (ZR Express)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>ضمان الجودة الرسمية</span>
                </div>
              </div>
            </div>

            {/* Department Quick Stats Stamp */}
            <div className="shrink-0 flex flex-col items-center justify-center p-5 rounded-2xl bg-[#FFD100] border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] min-w-[170px] text-center self-start md:self-center">
              <span className="text-[11px] font-black text-[#18181B] tracking-wider uppercase">
                إجمالي المعروضات
              </span>
              <span className="text-3xl font-black text-[#E30613] font-mono my-1 tabular-nums">
                {categoryProducts.length}
              </span>
              <span className="text-[11px] font-bold text-stone-800">منتجات جاهزة للطلب</span>
            </div>
          </div>
        </div>

        {/* Live Filter & Search Suite within this Department */}
        <div className="p-4 rounded-2xl bg-white border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search inside Department */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث داخل هذا القسم فقط..."
              className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs text-[#18181B] font-medium placeholder:text-stone-400 focus:outline-none focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <ArrowUpDown className="w-4 h-4 text-stone-500 shrink-0" />
            <span className="text-xs font-bold text-stone-700 whitespace-nowrap">الترتيب:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-[#18181B] bg-white focus:outline-none focus:border-[#E30613] cursor-pointer"
            >
              <option value="featured">المميزة والموصى بها</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantityInCart={0}
                onAddToCart={(p, vId) => onAddToCart(p, vId)}
                onOpenDetails={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white border-2 border-dashed border-stone-300 space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-2xl">
              📦
            </div>
            <h3 className="font-display text-lg font-bold text-[#18181B]">
              لا توجد معروضات مطابقة لبحثك في هذا القسم
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              جرب تغيير كلمة البحث أو تصفح باقي أقسام المتجر الغنية بمنتجات فرع الأغواط.
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
              >
                مسح كلمة البحث
              </button>
            )}
          </div>
        )}

        {/* Hop to other departments strip */}
        <div className="pt-8 border-t-2 border-stone-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base sm:text-lg font-bold text-[#18181B] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFD100]" />
              <span>تصفح بقية أقسام وتشكيلات تكنو الأغواط</span>
            </h3>
            <button
              type="button"
              onClick={onBackToHome}
              className="text-xs text-[#E30613] hover:underline font-bold"
            >
              عرض الكل بالرئيسية ←
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {otherDepartments.map((dept) => {
              const DeptIcon = dept.icon;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => {
                    onSelectCategory(dept.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-3.5 rounded-2xl bg-white border-2 border-stone-200 hover:border-[#18181B] text-right flex flex-col justify-between gap-3 transition-all hover:shadow-[3px_3px_0px_#18181B] hover:-translate-y-0.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-[#FAF8F5] border border-stone-200 text-[#18181B] group-hover:bg-[#FFD100] transition-colors">
                      <DeptIcon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-bold text-stone-500">{dept.tag}</span>
                  </div>
                  <span className="text-xs font-black text-[#18181B] group-hover:text-[#E30613] transition-colors line-clamp-1">
                    {dept.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
