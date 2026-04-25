import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery }     from '@tanstack/react-query'
import { cn }           from '@shared/lib'
import { ROUTES }       from '@shared/config'
import { useAuthStore } from '@features/auth/model/authStore'
import { useCartStore } from '@features/cart/model/cartStore'
import { isAdmin }      from '@entities/user/model'
import { fetchRootCategories } from '@features/catalog/api/catalogApi'
import { useFilterStore } from '@features/catalog/model/filterStore'

export function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [userMenuOpen, setUserMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { isAuth, user, logout } = useAuthStore()
  const { cart, openDrawer, loadCart } = useCartStore()
  const navigate = useNavigate()
  const filterStore = useFilterStore()

  // Fetch root categories for nav
  const { data: rootCats } = useQuery({
    queryKey: ['categories', 'roots'],
    queryFn:  fetchRootCategories,
    staleTime: 5 * 60 * 1000, // 5 min cache
  })

  // Load cart khi đã auth
  useEffect(() => {
    if (isAuth) loadCart()
  }, [isAuth, loadCart])

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const cartCount = cart?.totalItems ?? 0

  // Build navLinks từ API (root categories)
  const navLinks = [
    { to: ROUTES.shop, label: 'Cửa hàng', categoryId: undefined as number | undefined },
    ...(rootCats ?? []).slice(0, 4).map((cat) => ({
      to:         `${ROUTES.shop}?categoryId=${cat.categoryId}`,
      label:      cat.categoryName,
      categoryId: cat.categoryId as number | undefined,
    })),
  ]

  // Click category: cập nhật filterStore + navigate (đảm bảo ShopPage luôn nhận đúng filter)
  const handleNavClick = (link: typeof navLinks[number]) => {
    filterStore.resetFilter()
    if (link.categoryId) filterStore.setFilter({ categoryId: link.categoryId })
    navigate(link.to)
    setMenuOpen(false)
  }

  // Debounce search → navigate to shop with search param
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        filterStore.setFilter({ search: value.trim() })
        navigate(ROUTES.shop)
      }
    }, 400)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      filterStore.setFilter({ search: searchQuery.trim() })
      navigate(ROUTES.shop)
      setSearchOpen(false)
    }
  }

  return (
    <>
      <header className={cn(
        'sticky top-0 z-30 bg-brand-white transition-shadow duration-300',
        scrolled && 'shadow-sm',
      )}>
        {/* Announcement bar */}
        <div className="bg-brand-black text-brand-white text-center text-[10px] uppercase tracking-widest py-2">
          Miễn phí vận chuyển cho đơn hàng trên 500.000đ
        </div>

        <div className="container mx-auto px-6 max-w-screen-xl">
          <nav className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-8 h-8 flex flex-col justify-center gap-1.5" aria-label="Menu">
              <span className={cn('h-px bg-brand-black transition-all duration-300', menuOpen && 'rotate-45 translate-y-[7px]')} />
              <span className={cn('h-px bg-brand-black transition-all duration-300', menuOpen && 'opacity-0')} />
              <span className={cn('h-px bg-brand-black transition-all duration-300', menuOpen && '-rotate-45 -translate-y-[7px]')} />
            </button>

            {/* Desktop nav */}
            <ul className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <button
                    onClick={() => handleNavClick(link)}
                    className={cn(
                      'text-xs uppercase tracking-widest transition-colors duration-200',
                      'text-brand-mid hover:text-brand-black',
                    )}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Logo center */}
            <Link to={ROUTES.home}
              className="absolute left-1/2 -translate-x-1/2 font-display text-2xl tracking-widest hover:text-brand-gold transition-colors">
              LUXE
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="hidden sm:flex items-center text-brand-mid hover:text-brand-black transition-colors"
                  aria-label="Tìm kiếm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </button>

                {/* Search dropdown */}
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-brand-white border border-brand-light shadow-lg z-50 p-3">
                    <form onSubmit={handleSearchSubmit} className="flex gap-2">
                      <input
                        ref={searchRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Tìm sản phẩm..."
                        className="flex-1 border border-brand-light px-3 py-2 text-sm focus:outline-none focus:border-brand-black"
                      />
                      <button type="submit"
                        className="px-3 py-2 bg-brand-black text-brand-white text-xs uppercase tracking-wider hover:bg-brand-gold hover:text-brand-black transition-colors">
                        Tìm
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* User menu */}
              {isAuth ? (
                <div className="relative">
                  <button onClick={() => setUserMenu(!userMenuOpen)}
                    className="flex items-center gap-2 text-brand-mid hover:text-brand-black transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="hidden sm:block text-xs uppercase tracking-wider">
                      {user?.name.split(' ').at(-1)}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-brand-white border border-brand-light shadow-lg z-50">
                      <Link to={ROUTES.profile} onClick={() => setUserMenu(false)}
                        className="block px-4 py-3 text-xs uppercase tracking-wider hover:bg-brand-cream transition-colors">
                        Tài khoản
                      </Link>
                      <Link to={ROUTES.orders} onClick={() => setUserMenu(false)}
                        className="block px-4 py-3 text-xs uppercase tracking-wider hover:bg-brand-cream transition-colors">
                        Đơn hàng của tôi
                      </Link>
                      {isAdmin(user) && (
                        <Link to={ROUTES.admin} onClick={() => setUserMenu(false)}
                          className="block px-4 py-3 text-xs uppercase tracking-wider text-brand-gold hover:bg-brand-cream transition-colors">
                          Quản trị
                        </Link>
                      )}
                      <div className="border-t border-brand-light" />
                      <button onClick={() => { setUserMenu(false); logout() }}
                        className="block w-full text-left px-4 py-3 text-xs uppercase tracking-wider text-brand-mid hover:bg-brand-cream hover:text-red-500 transition-colors">
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to={ROUTES.login}
                  className="text-xs uppercase tracking-widest text-brand-mid hover:text-brand-black transition-colors">
                  Đăng nhập
                </Link>
              )}

              {/* Cart */}
              <button onClick={openDrawer}
                className="relative flex items-center text-brand-mid hover:text-brand-black transition-colors" aria-label="Giỏ hàng">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-brand-gold text-brand-black text-[9px] font-bold flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile menu */}
        <div className={cn(
          'lg:hidden border-t border-brand-light overflow-hidden transition-all duration-300',
          menuOpen ? 'max-h-96' : 'max-h-0',
        )}>
          {/* Mobile search */}
          <div className="px-6 py-3 border-b border-brand-light">
            <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(e); setMenuOpen(false) }}
              className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="flex-1 border border-brand-light px-3 py-2 text-sm focus:outline-none focus:border-brand-black"
              />
              <button type="submit" className="px-3 bg-brand-black text-brand-white text-xs">Tìm</button>
            </form>
          </div>
          <ul className="flex flex-col divide-y divide-brand-light/50">
            {navLinks.map((link) => (
              <li key={link.to}>
                <button
                  onClick={() => handleNavClick(link)}
                  className="block w-full text-left px-6 py-4 text-xs uppercase tracking-widest text-brand-charcoal hover:bg-brand-cream transition-colors"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Overlay to close search/userMenu */}
      {(searchOpen || userMenuOpen) && (
        <div className="fixed inset-0 z-20" onClick={() => { setSearchOpen(false); setUserMenu(false) }} />
      )}
    </>
  )
}