import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { personOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import "./Login.css";
import axios from "axios";
import { useAtom } from "jotai";
import store from "../store";

export const Login: React.FC = () => {
  const [registerClicked, setRegisterClicked] = useState<boolean>(false);

  const [animateParent] = useAutoAnimate<HTMLIonColElement>();

  const [isLoading, setIsLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [oldUsername, setOldUsername] = useState("");
  const [oldEmail, setOldEmail] = useState("");

  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
  const [isNewPasswordValid, setIsNewPasswordValid] = useState(true);
  const [isConfirmNewPasswordValid, setIsConfirmNewPasswordValid] =
    useState(true);

  const [isEdited, setIsEdited] = useState(false);

  const [user, setUser] = useAtom(store.user);
  const [isLoggedIn, setIsLoggedIn] = useAtom(store.loggedIn);

  const [toast] = useIonToast();

  const username_regex = /^[a-zA-Z0-9-_]{2,}$/;
  const email_regex =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  const password_regex = /^((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\W)).{8,}$/;
  const new_password_regex =
    /^(((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\W)).{8,})*$/;

  const getData = () => {
    setIsLoading(true);
    axios
      .get("/user/profile")
      .then((response) => {
        const result = response.data.data;
        setUser({
          id: result.id,
          username: result.username,
          email: result.email,
          files: result.files,
          folders: result.folders,
        });
        setIsLoggedIn(true);

        setUsername(result.username);
        setEmail(result.email);

        setOldUsername(result.username);
        setOldEmail(result.email);
        setIsLoading(false);
      })
      .catch(() => {
        axios
          .post("/user/refresh")
          .then(() => getData())
          .catch(() => {
            toast({
              message: "Cannot get user profile",
              duration: 3000,
              position: "top",
            });
            setUser({
              id: "",
              username: "",
              email: "",
              files: [],
              folders: [],
            });

            setUsername("");
            setEmail("");

            setOldUsername("");
            setOldEmail("");
            setIsLoading(false);
            setIsLoggedIn(false);
          });
      });
  };

  const handleLogin = () => {
    setIsLoading(true);
    axios
      .post("/user/login", {
        username,
        password,
      })
      .then(() => {
        getData();
        toast({
          message: "You're now logged in",
          duration: 3000,
          position: "top",
        });
      })
      .catch(() => {
        toast({
          message:
            "Cannot logged in, this maybe due to the incorrect credentials",
          duration: 3000,
          position: "top",
        });
        setIsLoggedIn(false);
      });
    setIsLoading(false);
  };

  const handleRegister = () => {
    setIsLoading(true);
    axios
      .post("/user/register", {
        username,
        email,
        password,
        confirmPassword,
      })
      .then((response) => {
        toast({
          message: "Register success, now use your credentials to login",
          duration: 3000,
          position: "top",
        });
        setIsLoading(false);
        setRegisterClicked(false);
        setConfirmPassword("");
      })
      .catch((error) => {
        toast({
          message: error,
          duration: 3000,
          position: "top",
        });
        setIsLoading(false);
      });
  };

  const handleLogout = () => {
    setIsLoading(true);
    axios
      .delete("/user/logout")
      .then(() => {
        toast({
          message: "Logout successfully",
          duration: 3000,
          position: "top",
        });
        setUser({ id: "", username: "", email: "", files: [], folders: [] });
        setIsLoggedIn(false);

        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        setOldUsername("");
        setOldEmail("");

        setIsLoading(false);
      })
      .catch(() => {
        toast({
          message: "Cannot logout",
          duration: 3000,
          position: "top",
        });
        setIsLoggedIn(false);
        setIsLoading(false);
      });
  };

  const handleUpdate = () => {
    setIsLoading(true);
    const request =
      newPassword && confirmNewPassword
        ? {
            username,
            email,
            password,
            newPassword,
            confirmPassword: confirmNewPassword,
          }
        : {
            username,
            email,
            password,
          };
    axios
      .put(`/user/update/${user.id}`, request)
      .then(() => {
        getData();
        setIsLoading(false);
        setIsEdited(false);
        if (newPassword) {
          setPassword(newPassword);
        }
        setNewPassword("");
        setConfirmNewPassword("");
      })
      .catch((error) => {
        toast({
          message: "The fields maybe incorrect, or the password doesn't match",
          duration: 3000,
          position: "top",
        });
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      getData();
    }
  }, []);

  const allValid = () => {
    return (
      isUsernameValid &&
      isEmailValid &&
      isPasswordValid &&
      isConfirmPasswordValid
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>File management app</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen={true}>
        <IonGrid
          className="ion-align-items-center container"
          id="profile-grid"
          fixed
        >
          <IonRow
            id="profile-grid"
            className="ion-align-items-center ion-align-self-center"
          >
            <IonCol
              class="ion-align-items-center ion-justify-content-center"
              size="12"
              sizeMd="4"
            >
              <IonRow class="ion-justify-content-center">
                <IonIcon
                  icon={personOutline}
                  id="login-icon"
                  class="ion-margin"
                />
              </IonRow>
              <IonRow class="ion-justify-content-center">
                <IonLabel>{isLoggedIn ? username : "Login"}</IonLabel>
              </IonRow>
            </IonCol>

            <IonCol size="12" sizeMd="7" ref={animateParent}>
              <IonItem
                className={`ion-margin ${
                  isUsernameValid ? "ion-valid" : "ion-invalid"
                }`}
              >
                <IonLabel position="floating">Username</IonLabel>
                <IonInput
                  type="text"
                  value={username}
                  onIonChange={(e) => {
                    setUsername(e.detail.value!);
                    if (isLoggedIn) {
                      setIsEdited(oldUsername !== e.detail.value!);
                    }
                    setIsUsernameValid(username_regex.test(e.detail.value!));
                  }}
                />
                <IonNote slot="error">Invalid username</IonNote>
              </IonItem>

              {(registerClicked || isLoggedIn) && (
                <IonItem
                  className={`ion-margin ${
                    isEmailValid ? "ion-valid" : "ion-invalid"
                  }`}
                >
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonChange={(e) => {
                      setEmail(e.detail.value!);
                      if (isLoggedIn) {
                        setIsEdited(oldEmail !== e.detail.value!);
                      }
                      setIsEmailValid(email_regex.test(e.detail.value!));
                    }}
                  />
                  <IonNote slot="error">Invalid email</IonNote>
                </IonItem>
              )}

              <IonItem
                className={`ion-margin ${
                  isPasswordValid ? "ion-valid" : "ion-invalid"
                }`}
              >
                <IonLabel position="floating">Password</IonLabel>
                <IonInput
                  type="password"
                  value={password}
                  onIonChange={(e) => {
                    setPassword(e.detail.value!);
                    if (isLoggedIn) {
                      setIsPasswordValid(password_regex.test(e.detail.value!));
                    } else {
                      setIsPasswordValid(
                        new_password_regex.test(e.detail.value!)
                      );
                    }
                  }}
                />
                <IonNote slot="error">Invalid password</IonNote>
              </IonItem>

              {isLoggedIn && (
                <>
                  <IonItem
                    className={`ion-margin ${
                      isNewPasswordValid ? "ion-valid" : "ion-invalid"
                    }`}
                  >
                    <IonLabel position="floating">New Password</IonLabel>
                    <IonInput
                      type="password"
                      value={newPassword}
                      onIonChange={(e) => {
                        setNewPassword(e.detail.value!);
                        setIsNewPasswordValid(
                          new_password_regex.test(e.detail.value!)
                        );
                        setIsEdited(true);
                      }}
                    />
                    <IonNote slot="error">Invalid new password</IonNote>
                  </IonItem>
                  <IonItem
                    className={`ion-margin ${
                      isConfirmNewPasswordValid ? "ion-valid" : "ion-invalid"
                    }`}
                  >
                    <IonLabel position="floating">
                      Confirm New Password
                    </IonLabel>
                    <IonInput
                      type="password"
                      value={confirmNewPassword}
                      onIonChange={(e) => {
                        setConfirmNewPassword(e.detail.value!);
                        setIsConfirmNewPasswordValid(
                          newPassword === e.detail.value!
                        );
                        setIsEdited(true);
                      }}
                    />
                    <IonNote slot="error">
                      Confirm new password does not match
                    </IonNote>
                  </IonItem>
                </>
              )}

              {registerClicked && (
                <IonItem
                  className={`ion-margin ${
                    isConfirmPasswordValid ? "ion-valid" : "ion-invalid"
                  }`}
                >
                  <IonLabel position="floating">Confirm Password</IonLabel>
                  <IonInput
                    type="password"
                    value={confirmPassword}
                    onIonChange={(e) => {
                      setConfirmPassword(e.detail.value!);
                      setIsConfirmPasswordValid(password === e.detail.value!);
                    }}
                  />
                  <IonNote slot="error">Invalid confirm password</IonNote>
                </IonItem>
              )}

              {!isLoggedIn && (
                <IonLabel
                  class="ion-float-left ion-margin"
                  onClick={() => setRegisterClicked(!registerClicked)}
                  id="login-label"
                >
                  {registerClicked ? "Or login" : "Don't have an account?"}
                </IonLabel>
              )}

              {isLoggedIn ? (
                <IonButton
                  class="ion-float-right ion-margin"
                  color={"warning"}
                  onClick={
                    isEdited ? () => handleUpdate() : () => handleLogout()
                  }
                >
                  {isLoading && <IonSpinner name="circular" color={"light"} />}
                  {isEdited ? "Save" : "Logout"}
                </IonButton>
              ) : (
                <IonButton
                  class="ion-float-right ion-margin"
                  color={"warning"}
                  disabled={!allValid()}
                  onClick={
                    registerClicked
                      ? () => handleRegister()
                      : () => handleLogin()
                  }
                >
                  {isLoading && <IonSpinner name="circular" color={"light"} />}
                  {registerClicked ? "Register" : "Login"}
                </IonButton>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
