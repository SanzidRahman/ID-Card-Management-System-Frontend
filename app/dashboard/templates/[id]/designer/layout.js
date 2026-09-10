// Full-screen layout for the designer — no dashboard sidebar/header
// The designer needs maximum space for the canvas
export const metadata = {
  title: 'ID Card Designer',
};

export default function DesignerLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {children}
    </div>
  );
}
