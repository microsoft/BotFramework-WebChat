#
# Pushes files to Github branch gh-pages-bh. Used in the build Publish-WebChat-pages-to-github.
# Note: git logs normal progress to stderr. Therefore, keep "Fail on standard error" disabled.
#
param
( 
    [string]$newFilesPath,          #"$(System.ArtifactsDirectory)/pages"
    [string]$branchName,            #gh-pages-bh
    [string]$repoRootPath           #"$(Build.SourcesFolder)"
)

#$newBranch = "$branchName-new";
Set-Location -Path $repoRootPath

# Set default identity
git config --global user.email "v-bruhal@micrsoft.com"
git config --global user.name "BruceHaley"

Write-Host "git checkout $branchName"
git checkout $branchName
Write-Host "git pull origin $branchName"
git pull origin $branchName
#git checkout -b $newBranch $branchName

#$result = git status
#Write-Host "git status result: [$result]"

#Write-Host "Debug 1 =============================================================="
#Get-ChildItem -Recurse -Force

Write-Host "Deleting the old files from $repoRootPath"
Get-Childitem -Recurse | Remove-Item -Force -Recurse

#Write-Host "Debug 2 =============================================================="
#Get-ChildItem -Recurse -Force

Write-Host "Copying the new files from $newFilesPath to $repoRootPath"
Copy-Item $newFilesPath/*.* -Destination $repoRootPath -Recurse

#Write-Host "Debug 3 =============================================================="
#Get-ChildItem -Recurse -Force

#Write-Host "Debug 4 =============================================================="
Write-Host "git add"
git add .
git add -u
$result = git status
Write-Host "git status result: [$result]"

if ($result -eq $null) {
    Write-Host "##vso[task.logissue type=error;] Fatal error: No git repository here."
    throw;
} else {
    if ($result.StartsWith('nothing to commit') -eq $true) {
        Write-Host "##vso[task.logissue type=error;] Quit without publishing: Everything up-to-date. Looks like these bits are already in GitHub."
        throw;
    }
}
Write-Host 'git commit -m...'
git commit -m "Automated push from build $Env:Build_BuildNumber"
Write-Host "git push origin $branchName"
git push origin $branchName

if ($LASTEXITCODE -eq 0) {
    Write-Host 'Writing Push Location section to the build summary page'
    Add-Content -Path "$newFilesPath\PushLocation.md" -Value "Bits pushed to GitHub here: [https://github.com/Microsoft/botbuilder-webchat/tree/$branchName/$repoRootPath](https://github.com/Microsoft/botbuilder-webchat/tree/$branchName/$repoRootPath)"
    Write-Host "##vso[task.addattachment type=Distributedtask.Core.Summary;name=Push_Location;] $newFilesPath/PushLocation.md"
}
