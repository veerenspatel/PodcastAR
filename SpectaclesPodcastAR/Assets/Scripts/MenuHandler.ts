import { ContainerFrame } from "SpectaclesInteractionKit/Components/UI/ContainerFrame/ContainerFrame";
import {SpectaclesBackendClient} from 'Scripts/SpectaclesBackendClient'

@component
export class NewScript extends BaseScriptComponent {
@input
containerFrame: ScriptComponent;

@input 
podcastContainer : ScriptComponent;
    
    @input 
   scr:SceneObject
    
   private spectaclesBackendClient: SpectaclesBackendClient
    private specs;

    onAwake() {

        let container = this.containerFrame.sceneObject.getComponent(ContainerFrame.getTypeName());
        container.closeButton.onTrigger.add(() => {
            container.sceneObject.enabled = false;
          });
            container.sceneObject.enabled=false
        
         this.specs = this.scr.getComponent(SpectaclesBackendClient.getTypeName());

    }

    openSpotifyMenu(){
        let container = this.containerFrame.sceneObject.getComponent(ContainerFrame.getTypeName());
        container.sceneObject.enabled = true;
    }

    openPodcastMenu(){
        let container = this.podcastContainer.sceneObject.getComponent(ContainerFrame.getTypeName());
        container.sceneObject.enabled = true;
    }
    
    stopListening(){
        print('here')
        this.specs.triggerListeningToPodcast(false)
    }


    
}
