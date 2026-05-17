Describe "Nexus Toolchain Baseline" {

  It "requires Node 22.x" {
    $node = (& node --version)
    $node | Should -Match "^v22\."
  }

  It "requires npm to be callable" {
    $npm = (& npm --version)
    $npm | Should -Not -BeNullOrEmpty
  }

  It "requires Git" {
    $git = (& git --version)
    $git | Should -Match "^git version"
  }

  It "requires ripgrep" {
    $rg = (& rg --version | Select-Object -First 1)
    $rg | Should -Match "^ripgrep"
  }

  It "requires jq" {
    $jq = (& jq --version)
    $jq | Should -Match "^jq-"
  }

  It "requires fd" {
    $fd = (& fd --version)
    $fd | Should -Match "^fd "
  }
}
