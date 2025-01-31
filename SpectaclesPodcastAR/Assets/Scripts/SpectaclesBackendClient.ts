import { WebSocketConnection } from "Scripts/Helper/WebSocketHelper";
import { ContainerFrame } from "../SpectaclesInteractionKit/Components/UI/ContainerFrame/ContainerFrame";

// let remoteServiceModule = require("LensStudio:RemoteServiceModule")
//let remoteMediaModule = require("LensStudio:RemoteMediaModule")

@component
export class SpectaclesBackendClient extends BaseScriptComponent {
  private containers = new Map<string, SceneObject>();

  private websocket: WebSocketConnection;
  private currentPodcastId;
  private username: string;
    
  @input
  remoteServiceModule: RemoteServiceModule;
  private remoteMediaModule: RemoteMediaModule = require('LensStudio:RemoteMediaModule');

  @input
  containerPrefab!: ObjectPrefab
    
    

  onAwake() {
        
        this.createEvent("TurnOffEvent").bind(()=>{
            if(this.username){ //if the podcast has already been triggered
                this.triggerListeningToPodcast(false)
            }
        })
       
  }
 

  initializeWebSocketConnection(username, podcastId) {

    this.username = username;
    this.currentPodcastId = podcastId;

    print(this.username+" "+this.currentPodcastId)
    this.websocket = new WebSocketConnection();
    this.websocket.onMessage((event) => {
      this.receiveMessage(event);
    });

    this.websocket.onClose(() => {
      this.triggerListeningToPodcast(false);
    });

    const delayedEvent = this.createEvent("DelayedCallbackEvent");
    delayedEvent.bind(()=>{    
            this.sendInitialMessage(username)})
    delayedEvent.reset(5)



  }

  sendInitialMessage(username){
    const data = JSON.stringify({ spectacles_device_id: username });
    this.websocket.send(data);
    }
    
  receiveMessage(event: WebSocketMessageEvent) {
    
    let str = event.data as string
    let obj = JSON.parse(str)
        
        
    if(obj['data']=='Connected'){
            print('connected to the web socket!')
        }
    //if data.start is true then call the instantiate image function
    else if(obj['start']==true){
        this.instantiateImage(obj);

    }else{
        this.destroyImage(obj['id']);
    }
  }
    

  async triggerListeningToPodcast(start: boolean) {
    print('triggering listening '+start+this.username+this.currentPodcastId)
        
        const response = await this.remoteServiceModule.fetch("https://arvprojects.com/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "spectacles_device_id": this.username,
         "podcast_id": this.currentPodcastId,
         "start": start
        }),
      })
        
        let re = await response.json()
        let re2 = JSON.stringify(re)
        print(re2)

    print('Success:');
  }

  async instantiateImage(data){
    let newContainer = this.containerPrefab.instantiate(this.getSceneObject());



    let container = newContainer.getComponent(ContainerFrame.getTypeName());
     container.setUseFollow(true)
    container.setIsFollowing(true)
    container.closeButton.onTrigger.add(() => {
      container.sceneObject.enabled = false;
    });
    

    
    let imageComponent = newContainer.getChild(0).getChild(0)

    let img = imageComponent.getComponent("Component.Image")
      

    img.mainMaterial = img.mainMaterial.clone();

      //request and set image
        let httpRequest = RemoteServiceHttpRequest.create();
        httpRequest.url = data['storage_url'];
        httpRequest.method = RemoteServiceHttpRequest.HttpRequestMethod.Get;
        this.remoteServiceModule.performHttpRequest(httpRequest, (response) => {
          if (response.statusCode === 200) {
            let textureResource = response.asResource();
            this.remoteMediaModule.loadResourceAsImageTexture(
              textureResource,
              (texture) => {
          
                img.mainPass.baseTex = texture;

              },
              (error) => {
                print('Error loading image texture: ' + error);
              }
            );
          }
        });

        this.containers.set(data['id'], newContainer);

  }

  destroyImage(mediaId){
        print('destroying image')
   let container = this.containers.get(mediaId);
    container.destroy();
  }
    
   async getPodcasts(){
        const response = await this.remoteServiceModule.fetch("https://arvprojects.com/getPodcasts",{
            method:"GET"
        })
        let res = await response.json()
        return res
    }


  async pausePlayback(){
    const response = await this.remoteServiceModule.fetch("https://arvprojects.com/spotify/pause?spectacles_device_id="+this.username, {
      method: "PUT",

    })
  }
  async playPlayback(){
    const response = await this.remoteServiceModule.fetch("https://arvprojects.com/spotify/play?spectacles_device_id="+this.username, {
      method: "PUT",
    })
  }
  async seekForward(){
    const response = await this.remoteServiceModule.fetch("https://arvprojects.com/spotify/seek/forward?spectacles_device_id="+this.username, {
      method: "PUT",
    })
  }
  async seekBackward(){
    const response = await this.remoteServiceModule.fetch("https://arvprojects.com/spotify/seek/backward?spectacles_device_id="+this.username, {
      method: "PUT",
    })
  }
    
   async captureMoment(){
         const response = await this.remoteServiceModule.fetch("https://arvprojects.com/capturemoment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "spectacles_device_id": this.username,
         "podcast_id": this.currentPodcastId,
        }),
      })
        
    }
}


