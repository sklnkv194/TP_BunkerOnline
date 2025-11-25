const Container = ({ children, className = "", fluid = false, direction }) => {
   return (
      <div className={`${fluid ? 'container-fluid' : 'container'} w-100 d-flex flex-${direction} ${className}`}>
      {children}
      </div>
   );
};

export default Container;