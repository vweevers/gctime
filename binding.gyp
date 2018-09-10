{
  "targets": [
    {
      "target_name": "gctime",
      "conditions": [
        ["OS == 'win'", {
          "defines": [
            "_HAS_EXCEPTIONS=0"
          ],
          "msvs_settings": {
            "VCCLCompilerTool": {
              "RuntimeTypeInfo": "false",
              "EnableFunctionLevelLinking": "true",
              "ExceptionHandling": "2",
              "DisableSpecificWarnings": ["4355", "4530" ,"4267", "4244", "4506"]
            }
          }
        }]
      ],
      "sources": ["gctime.cc"],
      "include_dirs" : [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}
