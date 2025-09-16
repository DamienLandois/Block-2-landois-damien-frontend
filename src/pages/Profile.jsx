import { getUser } from "@/lib/utils";
import { Check, Pencil } from "lucide-react";
import { useState } from "react";
import { userStore } from "./../lib/userStore";
import { toast } from "sonner";
export default function Profile() {
  const user = getUser();

  console.log(user);

  const store = userStore();

  const [emailModification, setEmailModification] = useState(false);
  const [email, setEmail] = useState(user ? user.email : "");

  const [nameModification, setNameModification] = useState(false);
  const [name, setName] = useState(user ? user.name : "");

  const [firstnameModification, setFirstnameModification] = useState(false);
  const [firstname, setFirstname] = useState(user ? user.firstname : "");

  const emailRegex = /^\S+@\S+\.\S+$/;
  const handleClickInputEmail = () => {
    emailModification
      ? setEmailModification(false)
      : setEmailModification(true);
  };
  const handleClickModifyEmail = () => {
    emailModification
      ? setEmailModification(false)
      : setEmailModification(true);
    if (!emailRegex.test(email.trim())) {
      setEmail(user.email);
      return toast.error("Email invalide.");
    }
    store.updateUser(user.id, {
      email: email,
    });
    toast.success("Email modifié avec succès !");
  };

  const handleClickInputName = () => {
    nameModification ? setNameModification(false) : setNameModification(true);
  };
  const handleClickModifyName = () => {
    nameModification ? setNameModification(false) : setNameModification(true);
    if (name.trim().length === 0) {
      setName(user.name);
      return toast.error("Le nom est incorrect.");
    }
    store.updateUser(user.id, {
      name: name,
    });
    toast.success("Nom modifié avec succès !");
  };
  const handleClickInputFirstname = () => {
    firstnameModification
      ? setFirstnameModification(false)
      : setFirstnameModification(true);
  };
  const handleClickModifyFirstname = () => {
    firstnameModification
      ? setFirstnameModification(false)
      : setFirstnameModification(true);
    if (firstname.trim().length === 0) {
      setFirstname(user.firstname);
      return toast.error("Le prénom est incorrect.");
    }
    store.updateUser(user.id, {
      firstname: firstname,
    });
    toast.success("Prénom modifié avec succès !");
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
            {!nameModification ? (
              <span>{name}</span>
            ) : (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}{" "}
            {!nameModification ? (
              <div className="modify-pencil">
                <Pencil onClick={handleClickInputName} />
              </div>
            ) : (
              <div className="modify-check">
                <Check onClick={handleClickModifyName} />
              </div>
            )}
          </div>
          <div className="profile-item">
            <p>Prénom: </p>
            {!firstnameModification ? (
              <span>{firstname}</span>
            ) : (
              <input
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
            )}{" "}
            {!firstnameModification ? (
              <div className="modify-pencil">
                <Pencil onClick={handleClickInputFirstname} />
              </div>
            ) : (
              <div className="modify-check">
                <Check onClick={handleClickModifyFirstname} />
              </div>
            )}
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
