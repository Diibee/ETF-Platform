import { NavLink } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/" className="font-bold text-gray-900 text-base tracking-tight">
          📈 ETF Platform Italia
        </NavLink>
        <div className="flex items-center gap-6 text-sm font-medium">
          <NavLink
            to="/catalogue"
            className={({ isActive }) =>
              isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }
          >
            Catalogo
          </NavLink>
          <NavLink
            to="/simulator"
            className={({ isActive }) =>
              isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }
          >
            Simulatore
          </NavLink>
          <NavLink
            to="/questionnaire"
            className={({ isActive }) =>
              isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }
          >
            Profilo
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
