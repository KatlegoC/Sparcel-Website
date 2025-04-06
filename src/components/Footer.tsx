export const Footer = () => {
  return (
    <footer className="mt-auto">
      <div className="container py-12 sm:py-16">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-8">
            <img
              src="/Vector 104.png"
              alt="Vector"
              className="h-28 sm:h-40 w-auto -mr-2"
            />
            <img
              src="/SparcelReturnsWhite.png"
              alt="Sparcel Returns"
              className="h-20 sm:h-24 w-auto"
            />
          </div>

          <div className="mt-8 text-gray-300 font-poppins">
            <p>&copy; {new Date().getFullYear()} Sparcel. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
