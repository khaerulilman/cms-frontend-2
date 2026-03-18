export default function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="text-2xl font-bold gradient-text mb-4">
              Your Dash
            </div>
            <p className="text-slate-400 text-sm">
              The headless CMS built for developer portfolios.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-medium mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors">
                  API Reference
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
          &copy; 2026 Yourdash. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
