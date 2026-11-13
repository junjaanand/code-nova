from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from apps.api.db.database import db
from apps.api.auth.rbac import require_role
from packages.schemas.models import (
    Rule, Fact, Term, Asset, RoleEnum, RuleCategoryEnum, SeverityEnum
)

router = APIRouter(tags=["Rules, Facts & Assets"])

# ----------------- RULES -----------------
@router.get("/rules")
def list_rules(category: Optional[RuleCategoryEnum] = None, severity: Optional[SeverityEnum] = None):
    rules = list(db.rules.values())
    if category:
        rules = [r for r in rules if r.category == category]
    if severity:
        rules = [r for r in rules if r.severity == severity]
    return rules

@router.post("/rules")
def create_rule(rule: Rule, current_user = Depends(require_role([RoleEnum.ADMIN]))):
    db.rules[rule.id] = rule
    return rule

@router.put("/rules/{rule_id}")
def update_rule(rule_id: str, rule: Rule, current_user = Depends(require_role([RoleEnum.ADMIN]))):
    if rule_id not in db.rules:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.rules[rule_id] = rule
    return rule

@router.delete("/rules/{rule_id}")
def delete_rule(rule_id: str, current_user = Depends(require_role([RoleEnum.ADMIN]))):
    if rule_id in db.rules:
        del db.rules[rule_id]
        return {"status": "deleted", "id": rule_id}
    raise HTTPException(status_code=404, detail="Rule not found")

# ----------------- FACTS -----------------
@router.get("/facts")
def list_facts():
    return list(db.facts.values())

@router.post("/facts")
def create_fact(fact: Fact, current_user = Depends(require_role([RoleEnum.ADMIN, RoleEnum.MANAGER]))):
    db.facts[fact.id] = fact
    return fact

@router.put("/facts/{fact_id}")
def update_fact(fact_id: str, fact: Fact, current_user = Depends(require_role([RoleEnum.ADMIN, RoleEnum.MANAGER]))):
    if fact_id not in db.facts:
        raise HTTPException(status_code=404, detail="Fact not found")
    db.facts[fact_id] = fact
    return fact

# ----------------- TERMS -----------------
@router.get("/terms")
def list_terms():
    return list(db.terms.values())

@router.post("/terms")
def create_term(term: Term, current_user = Depends(require_role([RoleEnum.ADMIN]))):
    db.terms[term.id] = term
    return term

# ----------------- ASSETS -----------------
@router.get("/assets")
def list_assets():
    return list(db.assets.values())

@router.post("/assets")
def create_asset(asset: Asset, current_user = Depends(require_role([RoleEnum.ADMIN]))):
    db.assets[asset.id] = asset
    return asset
