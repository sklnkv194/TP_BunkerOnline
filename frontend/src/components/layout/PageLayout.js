const PageLayout = ({ children}) => {
  return (
    <div className={`min-vh-100`} style={{ backgroundColor: '#3D3B40'}}>
      {children}
    </div>
  );
};
export default PageLayout;