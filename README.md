# Journey.js

The idea of journey.js to provide an easy way to build an online presentation with audio and synchronize the slides and the audio. It's highly inspired by impress.js which extended prezi by adding the third dimension. By extending the idea, journey.js adds a fourth dimension to the online presentation -- Time. 

## Features

### Text typing animation
```html
    <p class="journey-slide auto-type">some text</p>
```
### audio
```html
    <audio id="journey-audio" src="bla"/>
```
You can specify a piece of audio for the presentation. The idea that the presentation will play automatically while the music is playing. And the presentation will end when the music ends.

### img slide
```html
    <img class="journey-slide" src="bla.png"/>
```
### slide duration
```html
    <p class="journey-slide" data-duration="3">some text</p>
```
be specific about how many seconds should be spent on this slide. If omitted, journey.js will evenly distribute certain amount of time for each slide based on the time left (length of the audio - time guaranteed to other slides)/(num of slides - num of slides w/ specific duration configuration)

### API
- journey.init
- journey.play
- journey.pause
- journey.resume
- journey.stop
- journey.next
- journey.prev

#### State Machine
                       stop/next/prev
                  |----------------------|
                  ||                     |
                  ||                     |
        init      v|         play        |           pause
    ---------> STOPPED -------------> PLAYING ------------------> PAUSED
                  ^|                     ^                          |
                  ||                     |                          |
                  ||                     |                          |
                  ||                     ---------------------------|
                  ||                                 resume         |
                  ||                                                | 
                  ||                                                |
                  --------------------------------------------------|
                                    stop/next/prev                            


## Credit
I did this journey.js in order to learn some javascript and css basics. A lot of the ideas and code comes straight from [impress.js](https://github.com/bartaz/impress.js)
