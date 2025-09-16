import { getUser } from "@/lib/utils";
import { Check, Pencil } from "lucide-react";
import { useState } from "react";
import { userStore } from "./../lib/userStore";

export default function Profile() {
  const user = getUser();

  console.log(user);

  const store = userStore();

  const [emailModification, setEmailModification] = useState(false);
  const [email, setEmail] = useState(user ? user.email : "");

  const handleClickInputEmail = () => {
    emailModification
      ? setEmailModification(false)
      : setEmailModification(true);
  };
  const handleClickModifyEmail = () => {
    emailModification
      ? setEmailModification(false)
      : setEmailModification(true);

    store.updateUser(user.id, {
      email: email,
    });
  };

  return (
    <>
      {user && (
        <div className="profile-container">
          <h2 className="text-2xl font-bold mb-4">Mon Profil</h2>
          <div className="profile-item">
            <p>Email: </p>
            {!emailModification ? (
              <span>{email} </span>
            ) : (
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}{" "}
            {!emailModification ? (
              <div className="modify-pencil">
                <Pencil onClick={handleClickInputEmail} />
              </div>
            ) : (
              <div className="modify-check">
                <Check onClick={handleClickModifyEmail} />
              </div>
            )}
          </div>
          <div className="profile-item">
            <p>Nom: </p>
            <span>{user.name}</span>{" "}
            <div className="modify-pencil">
              <Pencil />
            </div>
          </div>
          <div className="profile-item">
            <p>Prénom: </p>
            <span>{user.firstname} </span>
            <div className="modify-pencil">
              <Pencil />
            </div>
          </div>
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
