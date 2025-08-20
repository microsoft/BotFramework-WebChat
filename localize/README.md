# Localization

This directory contains the required localization configuration file (`LocProject.json`) that services this repository. This file controls which resources are included in the localization pipeline.


## Maintenance Tasks

### Localization PRs

Our service generates localization PRs using the `Juno-OneLocBuild-Prod` Managed Identity. Please ensure these PRs are approved in a timely manner to guarantee the latest translations are included in builds. We ask teams to prioritize the completion of these PRs continuously.

### Adding New Resource Files for Localization

To add new resource files for localization:

1. In the `LocProject.json` file, add a new entry in the `LocItems` array following the existing pattern (all relative paths are from the root of the repository):
   ```json
   {
     "SourceFile": "folder-A\\folder-B\\folder-C\\YourResourceFile.en-US.resx",
     "OutputPath": "folder-A\\folder-B\\folder-C\\YourResourceFile.{Lang}.resx",
     "CopyOption": "UsePlaceholders"
   }
   ```

2. For additional OutputPath bin placing naming conventions, visit [https://aka.ms/AllAboutLoc](https://aka.ms/AllAboutLoc) (refer to 'Author Localization Project File' topic) or [here](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-experiences-and-ecosystems/cme-international-customer-exp/software-localization-onelocbuild/onelocbuild/onboarding/localizationproject#copyoption-outputpath-optional).

### File Changes

- **Deleted files**: Remove corresponding entries from the LocProject file
- **Renamed files**: Update `SourceFile` and `OutputPath` in the LocProject file
- **Files no longer needing localization**: Remove those entries from the LocProject file

### Localization Bugs

To report any localization bugs or issues with the deliverables, contact us at https://aka.ms/AllAboutLoc 

## Important Notes

⚠️ **Before expanding language support or onboarding new repos for localization:**

Contact the localization team at [https://aka.ms/AllAboutLoc](https://aka.ms/AllAboutLoc) to:

- Ensure language expansion is approved
- Verify sufficient localization budget
- Plan localization timeline
