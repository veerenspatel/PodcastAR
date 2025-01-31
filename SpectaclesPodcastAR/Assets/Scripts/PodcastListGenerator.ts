/**
 * This class is responsible for creating and positioning grid content items based on a specified prefab and item count. It instantiates the items and arranges them vertically with a specified offset.
 */
import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import {SpectaclesBackendClient} from 'Scripts/SpectaclesBackendClient'
import { ContainerFrame } from '../SpectaclesInteractionKit/Components/UI/ContainerFrame/ContainerFrame';
import NativeLogger from "SpectaclesInteractionKit/Utils/NativeLogger";

const log = new NativeLogger("MyNativeLogger");
let user ;
global.userContextSystem.requestUsername(function(username){
    user=username
  print(username)
})


    declare global {
    var currentPodcastId: number;
    }



//fetch podcast lists this would actually be a dictionary of name to id

let podcasts = new Map<string, string>();


@component
export class GridContentCreator extends BaseScriptComponent {
  @input
  itemPrefab!: ObjectPrefab

  @input
  containerFrame:ScriptComponent;

  @input 
  spotifyMenu:ScriptComponent;
    
  @input 
   scr:SceneObject
   
    private spectaclesBackendClient: SpectaclesBackendClient
    private specs;
    private spotifyMenuContainer;

 
     async onAwake():   Promise<void> {
     //   this.spectaclesBackendClient = new SpectaclesBackendClient()
        this.specs = this.scr.getComponent(
      SpectaclesBackendClient.getTypeName()
    );

    this.spotifyMenuContainer = this.spotifyMenu.sceneObject.getComponent(ContainerFrame.getTypeName());

    let podcastList = await this.specs.getPodcasts()

  
    podcastList.forEach(podcast => {
      
      podcasts.set(podcast['name'], podcast['id']);
    });
  

    const yStart = -10
    const yOffset = -6.5
      let i =0;
    for (const podcast of podcasts.keys()) {
      const item = this.itemPrefab.instantiate(this.getSceneObject())
      let text=item.getChild(0).getComponent('Text')
      text.horizontalOverflow = HorizontalOverflow.Wrap
      text.text=podcast

      let button = item.getChild(2).getComponent(PinchButton.getTypeName())
      
      button.onButtonPinched.add(() => this.onStateChangedCallback(podcast));
      const screenTransform = item.getComponent("Component.ScreenTransform")
      screenTransform.offsets.setCenter(new vec2(15, yStart + yOffset * i))
      item.enabled = true
      i++;
    }

    
  }

  setUpGrid(sceneObject) {
    
   
  }

    
  

    onStateChangedCallback = (podcast) => {
      this.containerFrame.sceneObject.enabled=false;

   this.specs.initializeWebSocketConnection(user,podcasts.get(podcast));
  this.specs.triggerListeningToPodcast(true);    

   this.spotifyMenuContainer.sceneObject.enabled = true;


  };
}
