import userStore from "@/lib/userStore";

export default function Profile() {
  const { user } = userStore();
  return (
    <>
      {user && (
        <div className="container mx-auto p-4">
          <h2 className="text-2xl font-bold mb-4">Mon Profil</h2>
          <p>
            Bienvenue sur votre page de profil. Ici, vous pouvez voir et gérer
            vos informations personnelles.
          </p>
        </div>
      )}
      {!user && (
        <div className="container mx-auto p-4">
          <h2 className="text-2xl font-bold mb-4">Vous n'êtes pas connecté</h2>
        </div>
      )}
    </>
  );
}
