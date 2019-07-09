#
# Pushes files to Github branch gh-pages. Used in the build Publish-WebChat-pages-to-github.
# Note: git logs normal progress to stderr. Therefore, keep "Fail on standard error" disabled.
#
param
( 
    [string]$newFilesPath,          #"$(System.ArtifactsDirectory)/pages"
    [string]$branchName,            #gh-pages
    [string]$repoRootPath,          #"$(Build.SourcesDirectory)"
    [string]$repoUserName,          #"NameOfUser"
    [string]$repoUserEmail          #"user@domain.com"
)

Set-Location -Path $repoRootPath

# Set default identity
git config --global user.email $repoUserEmail
git config --global user.name $repoUserName

# Preserve line endings (presumably LF)
git config --global core.autocrlf input

Write-Host "git checkout $branchName"
git checkout $branchName
Write-Host "git pull origin $branchName"
git pull origin $branchName

Write-Host "Deleting the old files from $repoRootPath"
Get-Childitem -Recurse | Remove-Item -Force -Recurse

Write-Host "Copying the new files from $newFilesPath to $repoRootPath"
Copy-Item $newFilesPath/*.* -Destination $repoRootPath -Recurse

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

#if ($LASTEXITCODE -eq 0) {
#    Write-Host 'Writing Push Location section to the build summary page'
#    Add-Content -Path "./PushLocation.md" -Value "Bits pushed to GitHub here: [https://github.com/microsoft/botbuilder-webchat/tree/$branchName/$repoRootPath](https://github.com/microsoft/botbuilder-webchat/tree/$branchName/$repoRootPath)"
# Broken:   Write-Host "##vso[task.addattachment type=Distributedtask.Core.Summary;name=Push_Location;] ./PushLocation.md"
#}
