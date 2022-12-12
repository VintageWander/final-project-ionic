import {
  IonBreadcrumb,
  IonBreadcrumbs,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Menu, MenuItem } from "@szhsin/react-menu";
import axios from "axios";
import { folderOpenOutline, warningOutline } from "ionicons/icons";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import ReactCompareImage from "react-compare-image";
import { API } from "..";
import { File } from "../model/File";
import { Folder } from "../model/Folder";
import state from "../store";
import "./FileHub.css";

export const FileHub = () => {
  const [user, setUser] = useAtom(state.user);
  const [isLoggedIn, setIsLoggedIn] = useAtom(state.loggedIn);

  const [breadCrumbs, setBreadCrumbs] = useState<String[]>([]);
  const [currentPath, setCurrentPath] = useState<String>("");

  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  const [currentFile, setCurrentFile] = useState<File>();

  const [currentFileVersion, setCurrentFileVersion] = useState(0);

  const [showVersions, setShowVersions] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  const [versions, setVersions] = useState<number[]>([]);

  const getVersions = (file_id: string) => {
    axios.get(`${API}/file/${file_id}/versions/`).then((response) => {
      setVersions(response.data.data.versions);
    });
  };

  const showVersionsModal = () => {
    return (
      <Modal
        show={showVersions}
        onHide={() => {
          setShowVersions(false);
          setCurrentFileVersion(0);
        }}
      >
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Versions</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {versions.length === 0 ? (
                <IonItem>
                  <IonLabel>There are no versions</IonLabel>
                </IonItem>
              ) : (
                versions.map((version) => (
                  <IonCard key={version}>
                    <img
                      alt={`${currentFile!.filename}`}
                      src={`${API}/content/${
                        currentFile!.id
                      }/versions/${version}`}
                    />
                    <IonCardTitle>{version}</IonCardTitle>
                    <IonCardContent>
                      <IonButton
                        fill="clear"
                        onClick={() => {
                          setShowCompare(true);
                          setCurrentFileVersion(version);
                        }}
                      >
                        Compare
                      </IonButton>
                      <IonButton
                        fill="clear"
                        href={`${API}/content/${
                          currentFile!.id
                        }/versions/${version}`}
                      >
                        Download
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                ))
              )}
            </IonList>
          </IonCardContent>
        </IonCard>
      </Modal>
    );
  };

  const showCompareModal = () => {
    const right = `${API}/content/${
      currentFile!.id
    }/versions/${currentFileVersion!}`;
    return (
      <Modal
        key={currentFileVersion!}
        show={showCompare}
        onHide={() => setShowCompare(false)}
      >
        <ReactCompareImage
          leftImage={`${API}/content/${currentFile!.id}`}
          rightImage={right}
        />
      </Modal>
    );
  };

  useEffect(() => {
    axios
      .get(
        `/file/${currentPath ? `?position=${currentPath}&` : ""}${
          isLoggedIn ? `?owner=${user.id}` : ""
        }`
      )
      .then((response) => {
        setFiles(response.data.data);
      });
    axios
      .get(
        `/folder/${currentPath ? `?position=${currentPath}&` : ""}${
          isLoggedIn ? `?owner=${user.id}` : ""
        }`
      )
      .then((response) => {
        setFolders(response.data.data);
      });
  }, [currentPath]);

  useEffect(() => {
    axios
      .get(
        `/file/${currentPath ? `?position=${currentPath}&` : ""}${
          isLoggedIn ? `?owner=${user.id}` : ""
        }`
      )
      .then((response) => {
        setFiles(response.data.data);
      });
    axios
      .get(
        `/folder/${currentPath ? `?position=${currentPath}&` : ""}${
          isLoggedIn ? `?owner=${user.id}` : ""
        }`
      )
      .then((response) => {
        setFolders(response.data.data);
      });
  }, []);

  useEffect(() => {
    setBreadCrumbs(["Root", ...breadCrumbs]);
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Public file hub</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonBreadcrumbs>
          {breadCrumbs.map((bread, id) => (
            <IonBreadcrumb
              id="bread"
              key={id}
              onClick={() => {
                let index = breadCrumbs.findIndex((b) => b === bread);
                setBreadCrumbs(breadCrumbs.slice(0, index + 1));
                if (bread === "Root") {
                  setCurrentPath("");
                } else {
                  setCurrentPath(bread);
                }
                console.log(bread);
              }}
            >
              {bread}
            </IonBreadcrumb>
          ))}
        </IonBreadcrumbs>
        <IonGrid>
          <IonRow class="ion-justify-content-center">
            {files.map((file) => (
              <IonCol key={file.id} size="12" sizeSm="7" sizeMd="6" sizeLg="3">
                <IonCard>
                  <img
                    alt={`${file.filename}`}
                    src={`${API}/content/${file.id}`}
                  />

                  <IonCardHeader>
                    <IonCardTitle>{file.fullFilename}</IonCardTitle>
                    <IonCardSubtitle>File</IonCardSubtitle>
                  </IonCardHeader>

                  <IonCardContent>Visibility: {file.visibility}</IonCardContent>
                  <Menu
                    menuButton={<IonButton fill="clear">Options</IonButton>}
                    transition
                    direction="bottom"
                  >
                    <MenuItem href={`${API}/content/${file.id}`}>
                      Download
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setShowVersions(true);
                        setCurrentFile(file);
                        getVersions(file.id);
                      }}
                    >
                      See versions
                    </MenuItem>
                  </Menu>
                </IonCard>
              </IonCol>
            ))}
            {showVersions && showVersionsModal()}
            {showCompare && showCompareModal()}
            {folders.map((folder) => (
              <IonCol
                key={folder.id}
                size="12"
                sizeSm="7"
                sizeMd="6"
                sizeLg="3"
                class="ion-justify-content-center"
              >
                <IonCard>
                  <IonCardHeader>
                    <IonIcon icon={folderOpenOutline} id="folder-icon" />
                    <IonCardTitle
                      id="folder-title"
                      onClick={() => {
                        console.log(`${currentPath}${folder.folderName}/`);
                        setBreadCrumbs([
                          ...breadCrumbs,
                          `${currentPath}${folder.folderName}/`,
                        ]);
                        setCurrentPath(`${currentPath}${folder.folderName}/`);
                      }}
                    >
                      {folder.folderName}
                    </IonCardTitle>
                    <IonCardSubtitle>Folder</IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    Visibility: {folder.visibility}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
          {files.length === 0 && folders.length === 0 && (
            <IonGrid class="container">
              <IonCol class="ion-align-items-center ion-align-self-center ion-justify-content-center container">
                <IonRow class="ion-justify-content-center ion-align-self-center container">
                  <IonIcon
                    class="ion-align-self-center"
                    icon={warningOutline}
                    id="warning-icon"
                  />
                </IonRow>
                <IonRow class="ion-justify-content-center ion-align-self-center container">
                  <IonLabel class="ion-align-self-center">
                    There are no files here
                  </IonLabel>
                </IonRow>
              </IonCol>
            </IonGrid>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
