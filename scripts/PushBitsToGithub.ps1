#
# Pushes files to Github branch gh-pages-bh. Used in the build Publish-WebChat-pages-to-github.
# Note: git logs normal progress to stderr. Therefore, keep "Fail on standard error" disabled.
#
param
( 
    [string]$sourcePath,            #$(System.ArtifactsDirectory)
    [string]$branchName,            #gh-pages-bh
    [string]$repoDestinationPath    #.
)

#$newBranch = "$branchName-new";

# Set default identity
git config --global user.email "v-bruhal@micrsoft.com"
git config --global user.name "BruceHaley"

git checkout $branchName
git pull origin $branchName
#git checkout -b $newBranch $branchName

Write-Host "Deleting the old files from ./$repoDestinationPath"
Remove-Item -Force ("./$repoDestinationPath/*.*")
Write-Host "Copying the new files from $sourcePath\*\** to ./$repoDestinationPath"
Copy-item -Force ("$sourcePath\*\**") -Destination ("./$repoDestinationPath")

git add .
git add -u
$result = git status
Write-Host "git status result: [$result]"

if ($result.StartsWith('nothing to commit') -eq $true) {
    Write-Host "##vso[task.logissue type=error;] Quit without publishing: Everything up-to-date. Looks like these bits are already in GitHub."
    throw;
}
Write-Host 'git commit -m...'
git commit -m "Automated push from build $Env:Build_BuildNumber"
Write-Host "git push origin $branchName"
git push origin $branchName

if ($LASTEXITCODE -eq 0) {
    Write-Host 'Writing Push Location section to the build summary page'
    Add-Content -Path "$sourcePath\PushLocation.md" -Value "Bits pushed to GitHub here: [https://github.com/Microsoft/botbuilder-webchat/tree/$branchName/$repoDestinationPath](https://github.com/Microsoft/botbuilder-webchat/tree/$branchName/$repoDestinationPath)"
    Write-Host "##vso[task.addattachment type=Distributedtask.Core.Summary;name=Push Location;] $sourcePath\PushLocation.md"
}
