export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[100px]">
      <div className="relative w-2 h-5">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[1px] h-[6px] bg-primary rounded-full"
            style={{
              left: "50%",
              top: "50%",
              transform: `rotate(${i * 30}deg)`,
              transformOrigin: "0 -10px",
              animation: `spinner-fade 1s linear ${i * 0.083}s infinite`,
              opacity: 1 - i * 0.08,
            }}
          />
        ))}
      </div>
    </div>
  );
};
