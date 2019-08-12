![Source: https://blog.runrun.it/melhores-podcasts/](https://dsj9gd804o60w.cloudfront.net/wp-content/uploads/2018/05/15_podcast_lideres_blog.gif)
# Podream - Making videos from podcasts
This is an open-source proof of concept project in which the program gets an audio and returns video with audio-related images using AI for:
* Understanding speech [(Speech to Text - PT-BR)](https://cloud.google.com/speech-to-text/)
* Understanding sentences and entities [(Google Natural Language)](https://cloud.google.com/natural-language/)
* Search for images [(Google Custom Search)](https://developers.google.com/custom-search/v1/overview)
Designed for Podcasts images purposes. 

Uses only Google Cloud Platform tools.

## Motivation
This is POC was motivated by my addiction to podcasts and videos. I know that some podcasts have a curated video slideshow, but not all of them can give this attention to content delivery, since podcast production and editing is quite time-demending already. Also, a friend told me she could not watch podcasts due to lack of visual stimulation.

## Requirements:
* [ffmpeg](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg)
* [ImageMagick with gm](https://www.npmjs.com/package/gm).
* [Yarn](https://yarnpkg.com/)
### OSX, You can also run:
```
brew install imagemagick
brew install graphicsmagick
brew install ffmpeg
brew install yarn
```

## Cloning Repo:
``` git clone https://github.com/maricatovictor/podream.git ```
## Usage
In order to run it, you'll be required to insert your Google Cloud Computing credentials (api_key, search_engine_id, etc.) for using GCP tools. 

### Audio 
The audio must be in .wav format, and you should place it in the content/audios folder. When the program asks, write the name of the audio, e.g.: "nerdcast.wav"

### Run
To run, open a terminal in the root project dir and execute:
```node index.js```

## Logic
* Import the audio
* Upload it to GCP Storage
* Request a transcription
* Analyse transcript and extract sentences
* From sentences, extract entities
* For each sentence, define the timestamp in which the sentence is present
* For each sentence, define a search-term (or sentence)
* Search for images with these search-term and save 3 image links for each sentence.
* Download the images - Each image is saved in the following format: {sentenceStartTimestamp}-{sentenceEndTimestamp}-(n)
* Convert the images (GM) 
* Generate a video with the original audio + images in given timestamps (extracted from image name) 
-- Uses [videoshow](https://github.com/h2non/videoshow/) that uses FFMpeg

Author: Victor Maricato. 2019
 

