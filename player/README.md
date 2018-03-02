# runner

Create the image

    docker build . -t xblanc/runner:latest


run it with
    
    cat .\scenario.json | docker run -i xblanc/runner