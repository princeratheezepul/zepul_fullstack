const Loader = () => {
  return (
    <div className="fixed inset-0  bg-opacity-100 backdrop-blur-sm flex items-center justify-center">
      <div className="animate-spin rounded-full h-26 w-26 border-t-4  border-[#36a1b6] border-opacity-50 " ></div>
    </div>
  );
};

export default Loader;