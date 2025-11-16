const PageWrapper = ({ children }) => (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ height: 'calc(100vh - 60px)' }}
    >
      <div className="w-100" style={{ maxWidth: '600px' }}>
        {children}
      </div>
    </div>
  );
  
  export default PageWrapper;  