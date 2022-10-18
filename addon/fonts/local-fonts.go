package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	port := flag.String("p", "8100", "port to serve on")
	directory := flag.String("d", ".", "the directory of static file to host")
	flag.Parse()
	
	http.HandleFunc("/", DoUt)

	log.Printf("Serving %s on HTTP port: %s\n", *directory, *port)
	log.Fatal(http.ListenAndServe(":"+*port, nil))
}

func DoUt(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	base, err := filepath.Abs(".")
	if err != nil {
	    print(err)
	    return
	}

	fullpath := filepath.Join(base, path)
    print(fullpath)

	_, err = os.Stat(fullpath)
	if os.IsNotExist(err){
		w.WriteHeader(http.StatusNotFound)
		return
	} else if err != nil {
    	return
	}

	w.Header().Set("content-type", "text/css; charset=utf-8")
	http.ServeFile(w, r, fullpath)
}
