const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-northeastern-black via-northeastern-gray-900 to-northeastern-red-dark text-white py-12 mt-auto">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-northeastern-red" style={{ fontFamily: 'Georgia, serif' }}>N</span>
              </div>
              <span className="text-xl font-black">NexusNU</span>
            </div>
            <p className="text-northeastern-gray-300 text-sm leading-relaxed">
              Connecting students, professors, and alumni at Northeastern University
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Quick Links</h3>
            <ul className="space-y-2 text-northeastern-gray-300 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/posts" className="hover:text-white transition-colors">Posts</a></li>
              <li><a href="/events" className="hover:text-white transition-colors">Events</a></li>
              <li><a href="/users" className="hover:text-white transition-colors">Users</a></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Connect With Us</h3>
            <p className="text-northeastern-gray-300 text-sm">
              360 Huntington Ave<br />
              Boston, MA 02115
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all" aria-label="Facebook">
                <span className="text-xl">📘</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all" aria-label="Twitter">
                <span className="text-xl">🐦</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all" aria-label="Instagram">
                <span className="text-xl">📷</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-northeastern-gray-400 text-sm text-center md:text-left">
              &copy; 2025 NexusNU. All rights reserved to Nishant Patil & Atharva Dalvi.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end space-x-4 lg:space-x-6 text-sm text-northeastern-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;