export default function Footer() {
  return (
    <footer className="border-t mt-8">
      <div className="container mx-auto p-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Raphaelle Massages. Tous droits réservés.
      </div>
    </footer>
  );
}