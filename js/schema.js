(function(root,factory){
  const value=factory();
  if(typeof module!=="undefined" && module.exports){module.exports=value;}
  root.ALF_SCHEMA=value;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  return {
  "schema_version": "1.0",
  "field_count": 113,
  "fields": [
    {
      "order": 1,
      "research_heading": "Patient ID",
      "master_column_index": 0,
      "master_excel_column": "A",
      "group": "Demographics"
    },
    {
      "order": 2,
      "research_heading": "Admission date",
      "master_column_index": 1,
      "master_excel_column": "B",
      "group": "Demographics"
    },
    {
      "order": 3,
      "research_heading": "Age at presentation (years)",
      "master_column_index": 2,
      "master_excel_column": "C",
      "group": "Demographics"
    },
    {
      "order": 4,
      "research_heading": "Sex",
      "master_column_index": 3,
      "master_excel_column": "D",
      "group": "Demographics"
    },
    {
      "order": 5,
      "research_heading": "Adult/Pediatric",
      "master_column_index": 4,
      "master_excel_column": "E",
      "group": "Demographics"
    },
    {
      "order": 6,
      "research_heading": "ALF etiology category",
      "master_column_index": 6,
      "master_excel_column": "G",
      "group": "Etiology"
    },
    {
      "order": 7,
      "research_heading": "Specific etiology",
      "master_column_index": 7,
      "master_excel_column": "H",
      "group": "Etiology"
    },
    {
      "order": 8,
      "research_heading": "Acetaminophen/paracetamol",
      "master_column_index": 8,
      "master_excel_column": "I",
      "group": "Etiology"
    },
    {
      "order": 9,
      "research_heading": "Drug-induced liver injury",
      "master_column_index": 9,
      "master_excel_column": "J",
      "group": "Etiology"
    },
    {
      "order": 10,
      "research_heading": "Viral hepatitis A",
      "master_column_index": 10,
      "master_excel_column": "K",
      "group": "Etiology"
    },
    {
      "order": 11,
      "research_heading": "Viral hepatitis B",
      "master_column_index": 11,
      "master_excel_column": "L",
      "group": "Etiology"
    },
    {
      "order": 12,
      "research_heading": "Viral hepatitis C",
      "master_column_index": 12,
      "master_excel_column": "M",
      "group": "Etiology"
    },
    {
      "order": 13,
      "research_heading": "Viral hepatitis E",
      "master_column_index": 13,
      "master_excel_column": "N",
      "group": "Etiology"
    },
    {
      "order": 14,
      "research_heading": "HIV",
      "master_column_index": 14,
      "master_excel_column": "O",
      "group": "Etiology"
    },
    {
      "order": 15,
      "research_heading": "Other viral cause",
      "master_column_index": 15,
      "master_excel_column": "P",
      "group": "Etiology"
    },
    {
      "order": 16,
      "research_heading": "Autoimmune hepatitis",
      "master_column_index": 16,
      "master_excel_column": "Q",
      "group": "Etiology"
    },
    {
      "order": 17,
      "research_heading": "Wilson disease",
      "master_column_index": 17,
      "master_excel_column": "R",
      "group": "Etiology"
    },
    {
      "order": 18,
      "research_heading": "Ischemic/shock liver",
      "master_column_index": 18,
      "master_excel_column": "S",
      "group": "Etiology"
    },
    {
      "order": 19,
      "research_heading": "Pregnancy-related ALF",
      "master_column_index": 19,
      "master_excel_column": "T",
      "group": "Etiology"
    },
    {
      "order": 20,
      "research_heading": "Malignant/infiltrative",
      "master_column_index": 20,
      "master_excel_column": "U",
      "group": "Etiology"
    },
    {
      "order": 21,
      "research_heading": "Other/indeterminate",
      "master_column_index": 21,
      "master_excel_column": "V",
      "group": "Etiology"
    },
    {
      "order": 22,
      "research_heading": "Etiology confirmed?",
      "master_column_index": 22,
      "master_excel_column": "W",
      "group": "Etiology"
    },
    {
      "order": 23,
      "research_heading": "Date/time of symptom onset",
      "master_column_index": 24,
      "master_excel_column": "Y",
      "group": "Presentation & severity"
    },
    {
      "order": 24,
      "research_heading": "Date/time of hospital presentation",
      "master_column_index": 25,
      "master_excel_column": "Z",
      "group": "Presentation & severity"
    },
    {
      "order": 25,
      "research_heading": "Date/time of ALF diagnosis",
      "master_column_index": 26,
      "master_excel_column": "AA",
      "group": "Presentation & severity"
    },
    {
      "order": 26,
      "research_heading": "Encephalopathy grade at presentation",
      "master_column_index": 27,
      "master_excel_column": "AB",
      "group": "Presentation & severity"
    },
    {
      "order": 27,
      "research_heading": "Highest encephalopathy grade",
      "master_column_index": 28,
      "master_excel_column": "AC",
      "group": "Presentation & severity"
    },
    {
      "order": 28,
      "research_heading": "INR at presentation",
      "master_column_index": 29,
      "master_excel_column": "AD",
      "group": "Presentation & severity"
    },
    {
      "order": 29,
      "research_heading": "Peak INR",
      "master_column_index": 30,
      "master_excel_column": "AE",
      "group": "Presentation & severity"
    },
    {
      "order": 30,
      "research_heading": "Total bilirubin at presentation",
      "master_column_index": 31,
      "master_excel_column": "AF",
      "group": "Presentation & severity"
    },
    {
      "order": 31,
      "research_heading": "Peak total bilirubin",
      "master_column_index": 32,
      "master_excel_column": "AG",
      "group": "Presentation & severity"
    },
    {
      "order": 32,
      "research_heading": "ALT at presentation",
      "master_column_index": 33,
      "master_excel_column": "AH",
      "group": "Presentation & severity"
    },
    {
      "order": 33,
      "research_heading": "Peak ALT",
      "master_column_index": 34,
      "master_excel_column": "AI",
      "group": "Presentation & severity"
    },
    {
      "order": 34,
      "research_heading": "AST at presentation",
      "master_column_index": 35,
      "master_excel_column": "AJ",
      "group": "Presentation & severity"
    },
    {
      "order": 35,
      "research_heading": "Peak AST",
      "master_column_index": 36,
      "master_excel_column": "AK",
      "group": "Presentation & severity"
    },
    {
      "order": 36,
      "research_heading": "Creatinine at presentation",
      "master_column_index": 37,
      "master_excel_column": "AL",
      "group": "Presentation & severity"
    },
    {
      "order": 37,
      "research_heading": "Peak creatinine",
      "master_column_index": 38,
      "master_excel_column": "AM",
      "group": "Presentation & severity"
    },
    {
      "order": 38,
      "research_heading": "Lactate at presentation",
      "master_column_index": 39,
      "master_excel_column": "AN",
      "group": "Presentation & severity"
    },
    {
      "order": 39,
      "research_heading": "Peak lactate",
      "master_column_index": 40,
      "master_excel_column": "AO",
      "group": "Presentation & severity"
    },
    {
      "order": 40,
      "research_heading": "Ammonia at presentation",
      "master_column_index": 41,
      "master_excel_column": "AP",
      "group": "Presentation & severity"
    },
    {
      "order": 41,
      "research_heading": "Peak ammonia",
      "master_column_index": 42,
      "master_excel_column": "AQ",
      "group": "Presentation & severity"
    },
    {
      "order": 42,
      "research_heading": "Glucose at presentation",
      "master_column_index": 43,
      "master_excel_column": "AR",
      "group": "Presentation & severity"
    },
    {
      "order": 43,
      "research_heading": "Lowest glucose",
      "master_column_index": 44,
      "master_excel_column": "AS",
      "group": "Presentation & severity"
    },
    {
      "order": 44,
      "research_heading": "Acidosis present",
      "master_column_index": 45,
      "master_excel_column": "AT",
      "group": "Complications & treatment"
    },
    {
      "order": 45,
      "research_heading": "Cerebral edema",
      "master_column_index": 46,
      "master_excel_column": "AU",
      "group": "Complications & treatment"
    },
    {
      "order": 46,
      "research_heading": "Acute kidney injury",
      "master_column_index": 47,
      "master_excel_column": "AV",
      "group": "Complications & treatment"
    },
    {
      "order": 47,
      "research_heading": "Need for renal replacement therapy",
      "master_column_index": 48,
      "master_excel_column": "AW",
      "group": "Complications & treatment"
    },
    {
      "order": 48,
      "research_heading": "Mechanical ventilation",
      "master_column_index": 49,
      "master_excel_column": "AX",
      "group": "Complications & treatment"
    },
    {
      "order": 49,
      "research_heading": "Vasopressor requirement",
      "master_column_index": 50,
      "master_excel_column": "AY",
      "group": "Complications & treatment"
    },
    {
      "order": 50,
      "research_heading": "NAC dose/duration",
      "master_column_index": 51,
      "master_excel_column": "AZ",
      "group": "Complications & treatment"
    },
    {
      "order": 51,
      "research_heading": "Antiviral therapy given",
      "master_column_index": 52,
      "master_excel_column": "BA",
      "group": "Complications & treatment"
    },
    {
      "order": 52,
      "research_heading": "Steroids for AIH given",
      "master_column_index": 53,
      "master_excel_column": "BB",
      "group": "Complications & treatment"
    },
    {
      "order": 53,
      "research_heading": "Chelation/other Wilson treatment given",
      "master_column_index": 54,
      "master_excel_column": "BC",
      "group": "Complications & treatment"
    },
    {
      "order": 54,
      "research_heading": "Antibiotics given",
      "master_column_index": 55,
      "master_excel_column": "BD",
      "group": "Complications & treatment"
    },
    {
      "order": 55,
      "research_heading": "Cerebral edema treatment given",
      "master_column_index": 56,
      "master_excel_column": "BE",
      "group": "Complications & treatment"
    },
    {
      "order": 56,
      "research_heading": "Plasma exchange/TPE performed",
      "master_column_index": 57,
      "master_excel_column": "BF",
      "group": "Complications & treatment"
    },
    {
      "order": 57,
      "research_heading": "Transplant evaluation performed",
      "master_column_index": 59,
      "master_excel_column": "BH",
      "group": "Transplant pathway"
    },
    {
      "order": 58,
      "research_heading": "Date transplant evaluation started",
      "master_column_index": 60,
      "master_excel_column": "BI",
      "group": "Transplant pathway"
    },
    {
      "order": 59,
      "research_heading": "Listed for transplant",
      "master_column_index": 61,
      "master_excel_column": "BJ",
      "group": "Transplant pathway"
    },
    {
      "order": 60,
      "research_heading": "Contraindication to transplant",
      "master_column_index": 62,
      "master_excel_column": "BK",
      "group": "Transplant pathway"
    },
    {
      "order": 61,
      "research_heading": "Reason not listed",
      "master_column_index": 63,
      "master_excel_column": "BL",
      "group": "Transplant pathway"
    },
    {
      "order": 62,
      "research_heading": "Transplant eligibility at any point",
      "master_column_index": 64,
      "master_excel_column": "BM",
      "group": "Transplant pathway"
    },
    {
      "order": 63,
      "research_heading": "Transferred/referred for transplant",
      "master_column_index": 65,
      "master_excel_column": "BN",
      "group": "Transplant pathway"
    },
    {
      "order": 64,
      "research_heading": "Transfer delay documented",
      "master_column_index": 66,
      "master_excel_column": "BO",
      "group": "Transplant pathway"
    },
    {
      "order": 65,
      "research_heading": "Time from listing to transplant (hours)",
      "master_column_index": 67,
      "master_excel_column": "BP",
      "group": "Transplant pathway"
    },
    {
      "order": 66,
      "research_heading": "Received liver transplant",
      "master_column_index": 68,
      "master_excel_column": "BQ",
      "group": "Transplant pathway"
    },
    {
      "order": 67,
      "research_heading": "Transplant type",
      "master_column_index": 69,
      "master_excel_column": "BR",
      "group": "Transplant pathway"
    },
    {
      "order": 68,
      "research_heading": "Reason transplant not performed",
      "master_column_index": 70,
      "master_excel_column": "BS",
      "group": "Transplant pathway"
    },
    {
      "order": 69,
      "research_heading": "Spontaneous/native liver survival",
      "master_column_index": 71,
      "master_excel_column": "BT",
      "group": "Outcomes"
    },
    {
      "order": 70,
      "research_heading": "Survived without transplant",
      "master_column_index": 72,
      "master_excel_column": "BU",
      "group": "Outcomes"
    },
    {
      "order": 71,
      "research_heading": "Death without transplant",
      "master_column_index": 73,
      "master_excel_column": "BV",
      "group": "Outcomes"
    },
    {
      "order": 72,
      "research_heading": "Death after transplant",
      "master_column_index": 74,
      "master_excel_column": "BW",
      "group": "Outcomes"
    },
    {
      "order": 73,
      "research_heading": "Graft survival",
      "master_column_index": 75,
      "master_excel_column": "BX",
      "group": "Outcomes"
    },
    {
      "order": 74,
      "research_heading": "Post-transplant complications",
      "master_column_index": 76,
      "master_excel_column": "BY",
      "group": "Outcomes"
    },
    {
      "order": 75,
      "research_heading": "Overall survival",
      "master_column_index": 78,
      "master_excel_column": "CA",
      "group": "Outcomes"
    },
    {
      "order": 76,
      "research_heading": "30-day survival",
      "master_column_index": 79,
      "master_excel_column": "CB",
      "group": "Outcomes"
    },
    {
      "order": 77,
      "research_heading": "90-day survival",
      "master_column_index": 80,
      "master_excel_column": "CC",
      "group": "Outcomes"
    },
    {
      "order": 78,
      "research_heading": "Hospital survival",
      "master_column_index": 81,
      "master_excel_column": "CD",
      "group": "Outcomes"
    },
    {
      "order": 79,
      "research_heading": "Length of hospital stay (days)",
      "master_column_index": 82,
      "master_excel_column": "CE",
      "group": "Outcomes"
    },
    {
      "order": 80,
      "research_heading": "ICU admission",
      "master_column_index": 83,
      "master_excel_column": "CF",
      "group": "Outcomes"
    },
    {
      "order": 81,
      "research_heading": "ICU length of stay (days)",
      "master_column_index": 84,
      "master_excel_column": "CG",
      "group": "Outcomes"
    },
    {
      "order": 82,
      "research_heading": "Discharge destination",
      "master_column_index": 85,
      "master_excel_column": "CH",
      "group": "Outcomes"
    },
    {
      "order": 83,
      "research_heading": "Readmission",
      "master_column_index": 86,
      "master_excel_column": "CI",
      "group": "Outcomes"
    },
    {
      "order": 84,
      "research_heading": "Death occurred",
      "master_column_index": 87,
      "master_excel_column": "CJ",
      "group": "Outcomes"
    },
    {
      "order": 85,
      "research_heading": "Date of death",
      "master_column_index": 88,
      "master_excel_column": "CK",
      "group": "Outcomes"
    },
    {
      "order": 86,
      "research_heading": "Primary cause of death",
      "master_column_index": 89,
      "master_excel_column": "CL",
      "group": "Cause of death"
    },
    {
      "order": 87,
      "research_heading": "Secondary cause/contributor",
      "master_column_index": 90,
      "master_excel_column": "CM",
      "group": "Cause of death"
    },
    {
      "order": 88,
      "research_heading": "Cerebral edema/herniation",
      "master_column_index": 91,
      "master_excel_column": "CN",
      "group": "Cause of death"
    },
    {
      "order": 89,
      "research_heading": "Sepsis/septic shock",
      "master_column_index": 92,
      "master_excel_column": "CO",
      "group": "Cause of death"
    },
    {
      "order": 90,
      "research_heading": "Multiorgan failure",
      "master_column_index": 93,
      "master_excel_column": "CP",
      "group": "Cause of death"
    },
    {
      "order": 91,
      "research_heading": "Cardiovascular collapse",
      "master_column_index": 94,
      "master_excel_column": "CQ",
      "group": "Cause of death"
    },
    {
      "order": 92,
      "research_heading": "Respiratory failure",
      "master_column_index": 95,
      "master_excel_column": "CR",
      "group": "Cause of death"
    },
    {
      "order": 93,
      "research_heading": "Hemorrhage",
      "master_column_index": 96,
      "master_excel_column": "CS",
      "group": "Cause of death"
    },
    {
      "order": 94,
      "research_heading": "Renal failure",
      "master_column_index": 97,
      "master_excel_column": "CT",
      "group": "Cause of death"
    },
    {
      "order": 95,
      "research_heading": "Other cause of death",
      "master_column_index": 98,
      "master_excel_column": "CU",
      "group": "Cause of death"
    },
    {
      "order": 96,
      "research_heading": "Days from symptom onset to presentation",
      "master_column_index": 99,
      "master_excel_column": "CV",
      "group": "Intervals & recovery"
    },
    {
      "order": 97,
      "research_heading": "Days from presentation to ALF diagnosis",
      "master_column_index": 100,
      "master_excel_column": "CW",
      "group": "Intervals & recovery"
    },
    {
      "order": 98,
      "research_heading": "Days from diagnosis to transplant evaluation",
      "master_column_index": 101,
      "master_excel_column": "CX",
      "group": "Intervals & recovery"
    },
    {
      "order": 99,
      "research_heading": "Days from diagnosis to listing",
      "master_column_index": 102,
      "master_excel_column": "CY",
      "group": "Intervals & recovery"
    },
    {
      "order": 100,
      "research_heading": "Days from diagnosis to transplant",
      "master_column_index": 103,
      "master_excel_column": "CZ",
      "group": "Intervals & recovery"
    },
    {
      "order": 101,
      "research_heading": "Days from diagnosis to death",
      "master_column_index": 104,
      "master_excel_column": "DA",
      "group": "Intervals & recovery"
    },
    {
      "order": 102,
      "research_heading": "Clinical deterioration before transplant",
      "master_column_index": 105,
      "master_excel_column": "DB",
      "group": "Intervals & recovery"
    },
    {
      "order": 103,
      "research_heading": "Clinical improvement before transplant",
      "master_column_index": 106,
      "master_excel_column": "DC",
      "group": "Intervals & recovery"
    },
    {
      "order": 104,
      "research_heading": "Spontaneous recovery documented",
      "master_column_index": 107,
      "master_excel_column": "DD",
      "group": "Intervals & recovery"
    },
    {
      "order": 105,
      "research_heading": "Vital status at last follow-up",
      "master_column_index": 108,
      "master_excel_column": "DE",
      "group": "Intervals & recovery"
    },
    {
      "order": 106,
      "research_heading": "Date of last follow-up",
      "master_column_index": 109,
      "master_excel_column": "DF",
      "group": "Intervals & recovery"
    },
    {
      "order": 107,
      "research_heading": "King's College Criteria met",
      "master_column_index": 124,
      "master_excel_column": "DU",
      "group": "Prognostic scores"
    },
    {
      "order": 108,
      "research_heading": "MELD score at presentation",
      "master_column_index": 125,
      "master_excel_column": "DV",
      "group": "Prognostic scores"
    },
    {
      "order": 109,
      "research_heading": "Highest MELD score",
      "master_column_index": 126,
      "master_excel_column": "DW",
      "group": "Prognostic scores"
    },
    {
      "order": 110,
      "research_heading": "MELD-Na at presentation",
      "master_column_index": 127,
      "master_excel_column": "DX",
      "group": "Prognostic scores"
    },
    {
      "order": 111,
      "research_heading": "Highest MELD-Na",
      "master_column_index": 128,
      "master_excel_column": "DY",
      "group": "Prognostic scores"
    },
    {
      "order": 112,
      "research_heading": "ALFSG Index (if available)",
      "master_column_index": 129,
      "master_excel_column": "DZ",
      "group": "Prognostic scores"
    },
    {
      "order": 113,
      "research_heading": "PELD score at presentation (pediatric, if applicable)",
      "master_column_index": 130,
      "master_excel_column": "EA",
      "group": "Prognostic scores"
    }
  ]
};
});
