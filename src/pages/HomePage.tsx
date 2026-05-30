import { Link } from 'react-router-dom';
import { ReturnDisclaimer } from '../components/common/ReturnDisclaimer';
import { FriendsDisclaimer } from '../components/common/FriendsDisclaimer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Analizza ETF e Fondi Indice
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          Strumento educativo personale per selezionare, confrontare e simulare ETF acquistabili in Italia.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            to="/catalogue"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Esplora il Catalogo →
          </Link>
          <Link
            to="/simulator"
            className="bg-white border border-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Simulatore Compound
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-12">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-2xl mb-2">🔍</p>
            <h3 className="font-semibold text-gray-900 mb-1">Catalogo ETF</h3>
            <p className="text-sm text-gray-500">Filtra per classe d'attivo, TER, domicilio, politica dividendi e classe di rischio SRI.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-2xl mb-2">📊</p>
            <h3 className="font-semibold text-gray-900 mb-1">Simulatore</h3>
            <p className="text-sm text-gray-500">Calcola il rendimento lordo e netto con tassazione italiana (26% + bollo 0.2%).</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-2xl mb-2">🇮🇹</p>
            <h3 className="font-semibold text-gray-900 mb-1">Fiscalità IT</h3>
            <p className="text-sm text-gray-500">Modello completo di tassazione italiana: capital gain, imposta di bollo, zainetto fiscale.</p>
          </div>
        </div>

        <div className="space-y-3 text-left">
          <FriendsDisclaimer />
          <ReturnDisclaimer />
        </div>
      </div>
    </div>
  );
}
