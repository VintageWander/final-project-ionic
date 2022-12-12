import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { folderOpenOutline, homeOutline, person } from "ionicons/icons";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import { Login } from "./pages/Login";
import { MyFiles } from "./pages/MyFiles";
import { FileHub } from "./pages/FileHub";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact={true} path="/file-hub">
            <FileHub />
          </Route>
          <Route exact={true} path="/my-files">
            <MyFiles />
          </Route>
          <Route path="/profile">
            <Login />
          </Route>
          <Route exact={true} path="/">
            <Redirect to="/file-hub" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="file-hub" href="/file-hub">
            <IonIcon icon={homeOutline} />
            <IonLabel>File Hub</IonLabel>
          </IonTabButton>
          <IonTabButton tab="my-files" href="/my-files">
            <IonIcon icon={folderOpenOutline} />
            <IonLabel>My files</IonLabel>
          </IonTabButton>
          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={person} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
