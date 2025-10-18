export const Footer = () => {
  return (
    <footer className="mt-auto">
      <div className="container py-12 sm:py-16">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-0">
            <img
              src="/Vector 104.png"
              alt="Vector"
              className="h-28 sm:h-40 w-auto"
            />
            <img
              src="/Sparcel copy.png"
              alt="Sparcel Returns"
              className="h-20 sm:h-24 w-auto -ml-4"
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
