export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-forest-700 to-emerald-700 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-forest-100">
            © {currentYear} Grace Springs Cabins. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm text-forest-100">
            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
