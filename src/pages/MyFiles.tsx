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
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import store from "../store";
import axios from "axios";
import ReactCompareImage from "react-compare-image";
import { File } from "../model/File";
import { Folder } from "../model/Folder";

import { API } from "..";
import {
  cloudOfflineOutline,
  documentOutline,
  folder,
  folderOpenOutline,
} from "ionicons/icons";
import { Menu, MenuItem } from "@szhsin/react-menu";
import { Form, Modal } from "react-bootstrap";

import "./MyFiles.css";

export const MyFiles = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast] = useIonToast();

  const [showEdit, setShowEdit] = useState(false);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showDeleteFile, setShowDeleteFile] = useState(false);
  const [showDeleteFolder, setShowDeleteFolder] = useState(false);

  const [user, setUser] = useAtom(store.user);
  const [isLoggedIn, setIsLoggedIn] = useAtom(store.loggedIn);

  const [currentPath, setCurrentPath] = useState<String>("");
  const [currentFile, setCurrentFile] = useState<File>();
  const [currentFolder, setCurrentFolder] = useState<Folder>();
  const [currentFileVersion, setCurrentFileVersion] = useState(0);

  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);

  const [folderName, setFolderName] = useState("");

  const [updatePosition, setUpdatePosition] = useState("");
  const [updateVisibility, setUpdateVisibility] = useState("");

  const [newPosition, setNewPosition] = useState("");
  const [newVisibility, setNewVisibility] = useState("");

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [preview, setPreview] = useState("");

  const [fileVersions, setFileVersions] = useState<number[]>([]);

  const [breadCrumbs, setBreadCrumbs] = useState<String[]>([]);

  const folderNameRegex = /^[a-zA-Z0-9-_]{3,}$/;

  const [isFoldernameValid, setIsFoldernameValid] = useState(true);

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

        setCurrentPath(new String(`${user.username}/`));
        setBreadCrumbs([...breadCrumbs, new String(`${user.username}/`)]);
        setIsLoggedIn(true);
        setIsLoading(false);
        setPreview("");
        setSelectedFile(null);
      })
      .catch(() => {
        axios
          .post("/user/refresh")
          .then(() => getData())
          .catch(() => {
            toast({
              message:
                "Cannot get user profile, this might be due to session timeout",
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

            setCurrentPath("");
            setBreadCrumbs([]);
            setIsLoggedIn(false);
            setIsLoading(false);
            setPreview("");
            setSelectedFile(null);
          });
      });
  };

  const getFiles = () => {
    axios
      .get(`/file/?owner=${user.id}&position=${currentPath}`)
      .then((response) => {
        const result = response.data.data;
        setFiles(result);
      })
      .catch((err) =>
        toast({
          message: "Cannot get user's files",
          duration: 3000,
          position: "top",
        })
      );
  };

  const getFolders = () => {
    axios
      .get(`/folder/?owner=${user.id}&position=${currentPath}`)
      .then((response) => {
        const result = response.data.data;
        setFolders(result);
      })
      .catch((err) =>
        toast({
          message: "Cannot get user's folders",
          duration: 3000,
          position: "top",
        })
      );
  };

  const getAllFolders = () => {
    axios
      .get(`/folder/?owner=${user.id}`)
      .then((response) => {
        const result = response.data.data;
        setAllFolders(result);
      })
      .catch((err) =>
        toast({
          message: "Cannot get user's folders",
          duration: 3000,
          position: "top",
        })
      );
  };

  const handleUpdate = (id: string) => {
    console.log(updatePosition);
    console.log(updateVisibility === "" ? "public" : "private");

    setIsLoading(true);
    axios
      .put(
        `/file/update/${id}`,
        {
          file: selectedFile,
          position: updatePosition,
          visibility: updateVisibility,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then(() => {
        toast({
          message: "Update file successfully",
          duration: 3000,
          position: "top",
        });

        handleCancel();
      })
      .catch((err) => {
        toast({
          message: `Error update file: ${err}. Could be due to wrong file format`,
          duration: 3000,
          position: "top",
        });

        handleCancel();
      });
    setIsLoading(false);
  };

  const handleCreate = () => {
    setIsLoading(true);
    axios
      .post(
        `/file/create/`,
        {
          file: selectedFile,
          position: newPosition,
          visibility: newVisibility,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then(() => {
        toast({
          message: "Create file successfully",
          duration: 3000,
          position: "top",
        });

        handleCancel();
      })
      .catch((err) => {
        toast({
          message: `Error new file: ${err}. Could be due to wrong file format`,
          duration: 3000,
          position: "top",
        });

        handleCancel();
      });
    setIsLoading(false);
  };

  const handleCreateFolder = () => {
    setIsLoading(true);
    axios
      .post(`/folder/create/`, {
        folderName,
        position: newPosition,
        visibility: newVisibility,
      })
      .then(() => {
        toast({
          message: "Create folder successfully",
          duration: 3000,
          position: "top",
        });

        handleCancel();
      })
      .catch((err) => {
        toast({
          message: `Error new file: ${err}. Could be due to wrong file format`,
          duration: 3000,
          position: "top",
        });

        handleCancel();
      });
    setIsLoading(false);
  };

  const handleCancel = () => {
    setUpdatePosition("");
    setUpdateVisibility("");
    setNewPosition("");
    setNewVisibility("");
    setSelectedFile(null);
    setCurrentFile(undefined);
    setCurrentFolder(undefined);
    setPreview("");
    setShowEdit(false);
    setShowCreate(false);
    setShowCreateFolder(false);
    setShowDeleteFile(false);
    setShowDeleteFolder(false);
    setShowEditFolder(false);
    setFolderName("");
    setIsFoldernameValid(true);
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

  const showEditModal = () => {
    return (
      <Modal
        show={showEdit}
        onHide={() => {
          setShowEdit(false);
          setCurrentFile(undefined);
        }}
      >
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Edit</IonCardTitle>
          </IonCardHeader>

          {preview ? (
            <img alt={`${currentFile!.filename}`} src={preview} />
          ) : (
            <img
              alt={`${currentFile!.filename}`}
              src={`${API}/content/${currentFile!.id}`}
            />
          )}

          <IonItem>
            <Form.Group>
              <Form.Label>Pick a file here</Form.Label>
              <Form.Control
                type="file"
                accept={
                  ["jpeg", "jpg"].includes(currentFile!.extension)
                    ? "image/jpeg"
                    : currentFile!.extension === "mp3"
                    ? "audio/mp3"
                    : currentFile!.extension === "txt"
                    ? "text/plain"
                    : "something"
                }
                onChange={(e) => {
                  console.log((e.target as HTMLInputElement).files![0]);
                  setSelectedFile((e.target as HTMLInputElement).files![0]);
                  setPreview(
                    URL.createObjectURL(
                      (e.target as HTMLInputElement).files![0]
                    )
                  );
                }}
              />
            </Form.Group>
          </IonItem>

          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel position="floating">
                  Filename (This field will change based on the uploaded
                  filename)
                </IonLabel>
                <IonInput
                  value={
                    selectedFile === null
                      ? currentFile!.filename
                      : selectedFile.name.split(".")[0]
                  }
                  disabled={true}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="floating">
                  Extension (Currently cannot be changed)
                </IonLabel>
                <IonInput
                  value={
                    selectedFile === null
                      ? currentFile!.extension
                      : selectedFile.type.split("/")[1]
                  }
                  disabled={true}
                />
              </IonItem>

              <IonItem>
                <Form.Select
                  onChange={(e) => {
                    console.log(e.target.value);
                    setUpdatePosition(e.target.value);
                  }}
                  defaultValue={`${user.username}/`}
                >
                  <option value={""}>{`${user.username}/`}</option>

                  {allFolders.map((folder) => (
                    <option
                      key={folder.id}
                      value={`${folder.fullpath.slice(
                        user.username.length + 1
                      )}`}
                    >
                      {folder.fullpath}
                    </option>
                  ))}
                </Form.Select>
              </IonItem>

              <IonItem>
                <IonLabel>Visibility (Private/Public)</IonLabel>
                <IonToggle
                  slot="end"
                  defaultChecked={currentFile!.position === "public"}
                  onIonChange={(e) => {
                    setUpdateVisibility(
                      e.detail.checked ? "public" : "private"
                    );
                  }}
                />
              </IonItem>
            </IonList>
            <IonButton fill="clear" onClick={() => handleCancel()}>
              Cancel
            </IonButton>
            <IonButton
              fill="clear"
              onClick={() => handleUpdate(currentFile!.id)}
            >
              {isLoading && <IonSpinner color={"dark"} name={"circular"} />}
              Save
            </IonButton>
          </IonCardContent>
        </IonCard>
      </Modal>
    );
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
              {fileVersions.length === 0 ? (
                <IonItem>
                  <IonLabel>There are no versions</IonLabel>
                </IonItem>
              ) : (
                fileVersions.map((version) => (
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
                      <IonButton
                        fill="clear"
                        onClick={() => handleRestore(currentFile!.id, version)}
                      >
                        {isLoading && (
                          <IonSpinner color={"dark"} name={"circular"} />
                        )}
                        Restore
                      </IonButton>

                      <IonButton
                        fill="clear"
                        onClick={() =>
                          handleDeleteVersion(currentFile!.id, version)
                        }
                      >
                        {isLoading && (
                          <IonSpinner color={"dark"} name={"circular"} />
                        )}
                        Delete
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

  const handleRestore = async (file_id: string, version: number) => {
    try {
      setIsLoading(true);
      await axios.put(`/file/${file_id}/versions/restore/${version}`);
      setIsLoading(false);
    } catch (err) {
      toast({
        message: "Cannot restore the file",
        duration: 3000,
        position: "top",
      });
      setIsLoading(false);
      return;
    }
  };

  const handleDeleteVersion = async (file_id: string, version: number) => {
    try {
      setIsLoading(true);
      await axios.delete(`/file/${file_id}/versions/delete/${version}`);
      setIsLoading(false);
      setShowVersions(false);
      toast({
        message: "Delete file version complete",
        duration: 3000,
        position: "top",
      });
    } catch (err) {
      toast({
        message: "Cannot delete the file version",
        duration: 3000,
        position: "top",
      });
      setIsLoading(false);
      return;
    }
  };

  const handleDeleteFile = (file_id: string) => {
    setIsLoading(true);
    axios
      .delete(`/file/delete/${file_id}`)
      .then(() => {
        handleCancel();
        toast({
          message: "Delete file success",
          duration: 3000,
          position: "top",
        });
      })
      .catch((err) => {
        handleCancel();
        toast({
          message: "Cannot delete file",
          duration: 3000,
          position: "top",
        });
      });
    setIsLoading(false);
  };

  const handleDeleteFolder = (folder_id: string) => {
    setIsLoading(true);
    axios
      .delete(`/folder/delete/${folder_id}`)
      .then(() => {
        handleCancel();
        toast({
          message: "Delete folder success",
          duration: 3000,
          position: "top",
        });
      })
      .catch((err) => {
        handleCancel();
        toast({
          message: "Cannot delete folder",
          duration: 3000,
          position: "top",
        });
      });
    setIsLoading(false);
  };

  const showDeleteFileModal = () => {
    return (
      <Modal show={showDeleteFile} onHide={() => setShowDeleteFile(false)}>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Delete this file?</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>Are you sure you want to delete this?</IonCardContent>
          <IonButton fill="clear" onClick={() => handleCancel()}>
            Cancel
          </IonButton>
          <IonButton
            fill="clear"
            color={"danger"}
            onClick={() => handleDeleteFile(currentFile!.id)}
          >
            Delete
          </IonButton>
        </IonCard>
      </Modal>
    );
  };

  const showDeleteFolderModal = () => {
    return (
      <Modal show={showDeleteFolder} onHide={() => setShowDeleteFolder(false)}>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Delete this Folder?</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            Are you sure you want to delete this folder?
          </IonCardContent>
          <IonButton fill="clear" onClick={() => handleCancel()}>
            Cancel
          </IonButton>
          <IonButton
            fill="clear"
            color={"danger"}
            onClick={() => handleDeleteFolder(currentFolder!.id)}
          >
            Delete
          </IonButton>
        </IonCard>
      </Modal>
    );
  };

  const showCreateModal = () => {
    return (
      <Modal
        show={showCreate}
        onHide={() => {
          setShowCreate(false);
        }}
      >
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Create new file</IonCardTitle>
          </IonCardHeader>
          <img src={preview} />

          <IonCardContent>
            <IonItem>
              <Form.Group>
                <Form.Label>Pick a file here</Form.Label>
                <Form.Control
                  type="file"
                  accept={
                    currentFile
                      ? ["jpeg", "jpg"].includes(currentFile!.extension)
                        ? "image/jpeg"
                        : currentFile!.extension === "mp3"
                        ? "audio/mp3"
                        : currentFile!.extension === "txt"
                        ? "text/plain"
                        : "something"
                      : "image/jpeg image/png audio/mp3 text/plain"
                  }
                  onChange={(e) => {
                    console.log((e.target as HTMLInputElement).files![0]);
                    setSelectedFile((e.target as HTMLInputElement).files![0]);
                    setPreview(
                      URL.createObjectURL(
                        (e.target as HTMLInputElement).files![0]
                      )
                    );
                  }}
                />
              </Form.Group>
            </IonItem>

            <IonList>
              <IonItem>
                <IonLabel position="floating">
                  Filename (This field will change based on the uploaded
                  filename)
                </IonLabel>
                <IonInput
                  value={
                    selectedFile === null
                      ? "Filename here"
                      : selectedFile.name.split(".")[0]
                  }
                  disabled={true}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="floating">
                  Extension (Currently cannot be changed)
                </IonLabel>
                <IonInput
                  value={
                    selectedFile === null
                      ? "Extension here"
                      : selectedFile.type.split("/")[1]
                  }
                  disabled={true}
                />
              </IonItem>

              <IonItem>
                <Form.Select
                  onChange={(e) => {
                    console.log(e.target.value);
                    setNewPosition(e.target.value);
                  }}
                  defaultValue={`${user.username}/`}
                >
                  <option value={""}>{`${user.username}/`}</option>

                  {allFolders.map((folder) => (
                    <option
                      key={folder.id}
                      value={`${folder.fullpath.slice(
                        user.username.length + 1
                      )}`}
                    >
                      {folder.fullpath}
                    </option>
                  ))}
                </Form.Select>
              </IonItem>

              <IonItem>
                <IonLabel>Visibility (Private/Public)</IonLabel>
                <IonToggle
                  slot="end"
                  onIonChange={(e) => {
                    setNewVisibility(e.detail.checked ? "public" : "private");
                  }}
                />
              </IonItem>
            </IonList>
            <IonButton fill="clear" onClick={() => handleCancel()}>
              Cancel
            </IonButton>
            <IonButton fill="clear" onClick={() => handleCreate()}>
              {isLoading && <IonSpinner color={"dark"} name={"circular"} />}
              Add
            </IonButton>
          </IonCardContent>
        </IonCard>
      </Modal>
    );
  };

  const showCreateFolderModal = () => {
    return (
      <Modal
        show={showCreateFolder}
        onHide={() => {
          setShowCreateFolder(false);
        }}
      >
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Create new folder</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonList>
              <IonItem
                className={`${isFoldernameValid ? "ion-valid" : "ion-invalid"}`}
              >
                <IonLabel position="floating">Folder name</IonLabel>
                <IonInput
                  onIonChange={(e) => {
                    setFolderName(e.detail.value!);
                    setIsFoldernameValid(folderNameRegex.test(e.detail.value!));
                  }}
                />
                <IonNote slot="error">
                  The folder name should be a-z A-Z 0-9 - _ and more than 2
                  characters
                </IonNote>
              </IonItem>

              <IonItem>
                <Form.Select
                  onChange={(e) => {
                    console.log(e.target.value);
                    setNewPosition(e.target.value);
                  }}
                  defaultValue={`${user.username}/`}
                >
                  <option value={""}>{`${user.username}/`}</option>

                  {allFolders.map((folder) => (
                    <option
                      key={folder.id}
                      value={`${folder.fullpath.slice(
                        user.username.length + 1
                      )}`}
                    >
                      {folder.fullpath}
                    </option>
                  ))}
                </Form.Select>
              </IonItem>

              <IonItem>
                <IonLabel>Visibility (Private/Public)</IonLabel>
                <IonToggle
                  slot="end"
                  onIonChange={(e) => {
                    setNewVisibility(e.detail.checked ? "public" : "private");
                  }}
                />
              </IonItem>
            </IonList>
            <IonButton fill="clear" onClick={() => handleCancel()}>
              Cancel
            </IonButton>
            <IonButton fill="clear" onClick={() => handleCreateFolder()}>
              {isLoading && <IonSpinner color={"dark"} name={"circular"} />}
              Add
            </IonButton>
          </IonCardContent>
        </IonCard>
      </Modal>
    );
  };

  const showEditFolderModal = () => {
    return (
      <Modal
        show={showEditFolder}
        onHide={() => {
          setShowEditFolder(false);
        }}
      >
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Edit folder</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonList>
              <IonItem
                className={`${isFoldernameValid ? "ion-valid" : "ion-invalid"}`}
              >
                <IonLabel position="floating">Folder name</IonLabel>
                <IonInput
                  type="text"
                  onIonChange={(e) => {
                    setFolderName(e.detail.value!);
                    setIsFoldernameValid(folderNameRegex.test(e.detail.value!));
                  }}
                  placeholder={currentFolder!.folderName}
                />
                <IonNote slot="error">
                  The folder name should be a-z A-Z 0-9 - _ and more than 2
                  characters
                </IonNote>
              </IonItem>

              <IonItem>
                <Form.Select
                  onChange={(e) => {
                    console.log(e.target.value);
                    setUpdatePosition(e.target.value);
                  }}
                >
                  <option value={""}>{`${user.username}/`}</option>

                  {allFolders
                    .filter(
                      (folder) =>
                        !folder.fullpath.startsWith(currentFolder!.fullpath)
                    )
                    .map((folder) => (
                      <option
                        key={folder.id}
                        value={`${folder.fullpath.slice(
                          user.username.length + 1
                        )}`}
                      >
                        {folder.fullpath}
                      </option>
                    ))}
                </Form.Select>
              </IonItem>

              <IonItem>
                <IonLabel>Visibility (Private/Public)</IonLabel>
                <IonToggle
                  slot="end"
                  onIonChange={(e) => {
                    setUpdateVisibility(
                      e.detail.checked ? "public" : "private"
                    );
                  }}
                />
              </IonItem>
            </IonList>
            <IonButton fill="clear" onClick={() => handleCancel()}>
              Cancel
            </IonButton>
            <IonButton
              fill="clear"
              onClick={() => handleUpdateFolder(currentFolder!.id)}
            >
              {isLoading && <IonSpinner color={"dark"} name={"circular"} />}
              Save
            </IonButton>
          </IonCardContent>
        </IonCard>
      </Modal>
    );
  };

  const handleUpdateFolder = (folder_id: string) => {
    setIsLoading(true);

    console.log({
      folderName,
      visibility: updateVisibility || currentFolder!.visibility,
      position:
        updatePosition ||
        currentFolder!.position.slice(user.username.length + 1),
    });
    axios
      .put(`/folder/update/${folder_id}`, {
        folderName,
        visibility: updateVisibility || currentFolder!.visibility,
        position:
          updatePosition ||
          currentFolder!.position.slice(user.username.length + 1),
      })
      .then((response) => {
        toast({
          message: "Update folder success",
          duration: 3000,
          position: "top",
        });
        handleCancel();
      })
      .catch((err) => {
        toast({
          message: "Update folder failed",
          duration: 3000,
          position: "top",
        });
        handleCancel();
      });
    setIsLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      getData();
      console.log(currentPath);
      getFiles();
      getFolders();
      getAllFolders();
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      console.log(currentPath);
      getFiles();
      getFolders();
      getAllFolders();
    }
  }, [
    currentPath,
    showEdit,
    showDeleteFile,
    showCreate,
    showCreateFolder,
    showEditFolder,
    showDeleteFolder,
    showVersions,
  ]);

  const getVersions = async (id: string) => {
    try {
      const response = await axios.get(`/file/${id}/versions/`);
      const result = response.data.data;
      setFileVersions(result.versions);
    } catch (err) {
      toast({
        message: "Cannot get versions",
        duration: 3000,
        position: "top",
      });
      setFileVersions([]);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>File management app</IonTitle>
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
                setCurrentPath(bread);
                console.log(bread);
              }}
            >
              {bread}
            </IonBreadcrumb>
          ))}
        </IonBreadcrumbs>

        {!isLoggedIn && (
          <IonGrid class="container">
            <IonCol class="ion-align-items-center ion-align-self-center ion-justify-content-center container">
              <IonRow class="ion-justify-content-center ion-align-self-center container">
                <IonIcon
                  class="ion-align-self-center"
                  icon={cloudOfflineOutline}
                  id="cloud-icon"
                />
              </IonRow>
              <IonRow class="ion-justify-content-center ion-align-self-center container">
                <IonLabel class="ion-align-self-center">
                  Please login to see this page
                </IonLabel>
              </IonRow>
            </IonCol>
          </IonGrid>
        )}

        <IonGrid id="offline-grid" class="ion-justify-content-center">
          {isLoggedIn && (
            <>
              <IonButton id="add-button" onClick={() => setShowCreate(true)}>
                <IonIcon icon={documentOutline} id="add-icon" />
                Add new file
              </IonButton>
              <IonButton
                id="add-button"
                onClick={() => setShowCreateFolder(true)}
              >
                <IonIcon icon={folder} id="add-icon" />
                Add new folder
              </IonButton>
            </>
          )}
          <IonRow id="offline-grid" class="ion-justify-content-center">
            {isLoggedIn && (
              <>
                {files.map((file) => (
                  <IonCol
                    key={file.id}
                    size="12"
                    sizeSm="7"
                    sizeMd="6"
                    sizeLg="3"
                    class="ion-justify-content-center"
                  >
                    <IonCard>
                      <img
                        alt={`${file.filename}`}
                        src={`${API}/content/${file.id}`}
                      />

                      <IonCardHeader>
                        <IonCardTitle>{file.fullFilename}</IonCardTitle>
                        <IonCardSubtitle>File</IonCardSubtitle>
                      </IonCardHeader>

                      <IonCardContent>
                        Visibility: {file.visibility}
                      </IonCardContent>

                      <Menu
                        menuButton={<IonButton fill="clear">Options</IonButton>}
                        transition
                        direction="bottom"
                      >
                        <MenuItem
                          onClick={() => {
                            setCurrentFile(file);
                            setShowEdit(true);
                          }}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem href={`${API}/content/${file.id}`}>
                          Download
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setShowVersions(true);
                            getVersions(file.id);
                            setCurrentFile(file);
                          }}
                        >
                          See versions
                        </MenuItem>
                      </Menu>
                      <IonButton
                        fill="clear"
                        color={"danger"}
                        onClick={() => {
                          setCurrentFile(file);
                          setShowDeleteFile(true);
                        }}
                      >
                        Delete
                      </IonButton>
                    </IonCard>
                  </IonCol>
                ))}
              </>
            )}
            {showEdit && showEditModal()}
            {showVersions && showVersionsModal()}
            {showCompare && showCompareModal()}
            {showCreate && showCreateModal()}
            {showCreateFolder && showCreateFolderModal()}
            {showDeleteFile && showDeleteFileModal()}

            {isLoggedIn &&
              folders.map((folder) => (
                <IonCol
                  key={folder.id}
                  size="12"
                  sizeSm="7"
                  sizeMd="6"
                  sizeLg="3"
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
                    <IonButton
                      fill="clear"
                      color={"primary"}
                      onClick={() => {
                        setCurrentFolder(folder);
                        setShowEditFolder(true);
                      }}
                    >
                      Edit
                    </IonButton>
                    <IonButton
                      fill="clear"
                      color={"danger"}
                      onClick={() => {
                        setCurrentFolder(folder);
                        setShowDeleteFolder(true);
                      }}
                    >
                      Delete
                    </IonButton>
                  </IonCard>
                </IonCol>
              ))}
            {showEditFolder && showEditFolderModal()}
            {showDeleteFolder && showDeleteFolderModal()}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
