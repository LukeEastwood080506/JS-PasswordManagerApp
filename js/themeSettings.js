function applyThemeSettings(){
    // Applies dark mode to page if enabled
    if(localStorage.getItem("darkMode") === "enabled"){
        document.documentElement.classList.add("dark-mode");
    }
    // Applies contrast mode to page if enabled.
    if(localStorage.getItem("contrastMode") === "enabled"){
        document.documentElement.classList.add("contrast-mode");
    }
    // Applies selected font size to the elements on the page if a font size value was entered.
    const savedFontSize = localStorage.getItem("fontSize");
    if(savedFontSize){
        document.documentElement.style.fontSize = savedFontSize + "px";
    }
}

applyThemeSettings();
