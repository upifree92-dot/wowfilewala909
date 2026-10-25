import React, { useEffect } from "react";

const LanguageSelector: React.FC = () => {
  useEffect(() => {
    // Only load the script if it's not already there
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        // @ts-ignore
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element",
        );

        // Change 'Select Language' to 'English'
        const checkExist = setInterval(() => {
          const combo = document.querySelector(
            ".goog-te-combo",
          ) as HTMLSelectElement;
          if (combo && combo.options.length > 0) {
            combo.options[0].text = "English";
            clearInterval(checkExist);
          }
        }, 100);
      };
    }
  }, []);

  return (
    <div id="google_translate_element" className="translate-container">
      {/* Google Translate will inject its iframe here */}
    </div>
  );
};

export default LanguageSelector;
