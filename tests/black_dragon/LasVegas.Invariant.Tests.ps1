Describe "Black Dragon Las Vegas Runtime Invariants" {

  BeforeAll {
    $CityPath = ".\public\data\clients\black_dragon\cities\las_vegas"
    $RuntimePath = ".\public\data\clients\black_dragon\runtime\las_vegas"
    $StatePolicyPath = ".\public\data\clients\black_dragon\states\nevada\single_city_runtime_policy.json"

    $RequiredFiles = @(
      "$StatePolicyPath",
      "$CityPath\las_vegas_operational_manifest.json",
      "$CityPath\source_registry.json",
      "$CityPath\entity_schema.json",
      "$CityPath\contact_governance_policy.json",
      "$CityPath\quarantined_entities.json",
      "$CityPath\manual_review_pipeline.json",
      "$CityPath\contact_readiness_scores.json",
      "$RuntimePath\runtime_shell.json"
    )

    $Policy = Get-Content $StatePolicyPath -Raw | ConvertFrom-Json
    $Runtime = Get-Content "$RuntimePath\runtime_shell.json" -Raw | ConvertFrom-Json
    $Entities = Get-Content "$CityPath\quarantined_entities.json" -Raw | ConvertFrom-Json
    $Review = Get-Content "$CityPath\manual_review_pipeline.json" -Raw | ConvertFrom-Json
    $Scores = Get-Content "$CityPath\contact_readiness_scores.json" -Raw | ConvertFrom-Json
    $SourceRegistry = Get-Content "$CityPath\source_registry.json" -Raw | ConvertFrom-Json
    $ContactGovernance = Get-Content "$CityPath\contact_governance_policy.json" -Raw | ConvertFrom-Json
  }

  It "has all required Las Vegas artifacts" {
    foreach ($file in $RequiredFiles) {
      Test-Path $file | Should -BeTrue
    }
  }

  It "keeps Nevada scoped to Las Vegas only" {
    $Policy.runtime_policy.active_runtime_city | Should -Be "Las Vegas"
    $Policy.runtime_policy.single_city_runtime_only | Should -BeTrue
    $Policy.runtime_policy.unmapped_city_expansion_forbidden | Should -BeTrue
  }

  It "keeps runtime city scope locked to Las Vegas" {
    $Runtime.runtime.city | Should -Be "Las Vegas"
    $Runtime.runtime.state | Should -Be "Nevada"
    $Runtime.runtime.city_scope_only | Should -BeTrue
    $Runtime.runtime.statewide_scope_forbidden | Should -BeTrue
  }

  It "keeps all entities quarantined and runtime-ineligible" {
    foreach ($entity in $Entities) {
      $entity.city | Should -Be "Las Vegas"
      $entity.state | Should -Be "Nevada"
      $entity.state_code | Should -Be "NV"
      $entity.quarantine_status | Should -Be "QUARANTINED"
      $entity.manual_review_status | Should -Be "REQUIRED"
      $entity.runtime_eligible | Should -BeFalse
      $entity.synthetic_entity | Should -BeFalse
    }
  }

  It "keeps all review queue items pending with no runtime promotion" {
    foreach ($item in $Review) {
      $item.city | Should -Be "Las Vegas"
      $item.state | Should -Be "Nevada"
      $item.review_status | Should -Be "PENDING"
      $item.runtime_promotion_allowed | Should -BeFalse
      $item.outbound_contact_allowed | Should -BeFalse
    }
  }

  It "keeps all contact readiness scores blocked" {
    foreach ($score in $Scores) {
      $score.city | Should -Be "Las Vegas"
      $score.state | Should -Be "Nevada"
      $score.contact_readiness_score | Should -Be 0
      $score.confidence_score | Should -Be 0
      $score.scoring_status | Should -Be "NOT_READY"
      $score.outbound_contact_allowed | Should -BeFalse
      $score.runtime_promotion_allowed | Should -BeFalse
    }
  }

  It "keeps source registry quarantine-first and no-promotion" {
    foreach ($source in $SourceRegistry.approved_sources) {
      $source.quarantine_required | Should -BeTrue
      $source.runtime_promotion_allowed | Should -BeFalse
    }
  }

  It "keeps contact governance hardlocked" {
    $ContactGovernance.contact_rules.no_auto_contact | Should -BeTrue
    $ContactGovernance.contact_rules.manual_review_required_for_contact | Should -BeTrue
    $ContactGovernance.contact_rules.outbound_promotion_disabled | Should -BeTrue
    $ContactGovernance.contact_rules.automated_actions_allowed | Should -BeFalse
    $ContactGovernance.contact_rules.bulk_contact_forbidden | Should -BeTrue
  }
}
