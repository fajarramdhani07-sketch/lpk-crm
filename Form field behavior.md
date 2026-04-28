**# Rebuild Candidate Form UI**



**## Summary**

**Rebuild the candidate-facing form into a structured Bahasa Indonesia accordion UI with section progress, stronger input types, predetermined option lists, conditional rows, mock uploads, and field-specific validation. Keep this frontend-only and persist values in the existing mock/Zustand store.**



**## Key Changes**

**- Replace the current long mixed form with accordion sections: Identitas, Data Pribadi, Pendidikan, Pengalaman Kerja, Keluarga, Lifestyle \& LPK, Dokumen.**

**- Use key-fields-only validation for final submit; draft save remains permissive.**

**- Convert all name fields to `UPPERCASE`, including `full\\\_name\\\_romaji`, `nickname`, and `family\\\*\\\_name`.**

**- Use date pickers for all date fields and derived read-only age fields where applicable.**

**- Use mock upload controls for file fields; no real backend upload.**



**## Field Behavior**

**- `submitted\\\_at`: auto-set on final submit, not manually edited.**

**- `email`: required, valid email, mock duplicate warning.**

**- `full\\\_name\\\_romaji`: required, uppercase Roman text.**

**- `full\\\_name\\\_katakana`: required, katakana validation.**

**- `nickname`: optional uppercase.**

**- `phone\\\_number`: required Indonesian mobile-style validation.**

**- `address`: rebuild as structured address fields, then map back to candidate address data.**

**- `profile\\\_photo`: required mock image upload with local filename/preview behavior.**

**- `birth\\\_date`, `birth\\\_place`: required; `age` is calculated read-only.**

**- `gender`: required select, `Laki-laki` / `Perempuan`.**

**- `height\\\_cm`, `weight\\\_kg`: required numeric inputs with reasonable ranges.**

**- `blood\\\_type`, `religion`, `marital\\\_status`, `passport\\\_status`: required predetermined selects.**

**- `medical\\\_history`: required text area.**

**- `wears\\\_glasses`: required Ya/Tidak select.**

**- `medical\\\_checkup\\\_file`: optional mock upload.**

**- `education`: required highest-education select.**

**- SD and SMP fields: required school name plus start/end dates.**

**- SMA/SMK fields: required block; type and major use predetermined choices with Other/free text.**

**- University fields: conditional; required only when attended or highest education is D1+; degree and major use predetermined choices with Other/free text.**

**- Education dates: validate chronological order across levels.**

**- `work\\\_experience`: derived from job rows.**

**- Latest job block: conditionally required when candidate has work experience; role uses select plus Other.**

**- Previous job 1 and 2 blocks: optional conditional rows; if one field is started, require the row.**

**- Job dates: validate chronological order and prevent overlapping ranges.**

**- `family\\\_information`: optional notes.**

**- Family rows 1-6: all conditional; each active row validates name, relation, birth date, calculated age, and occupation.**

**- `family\\\*\\\_relation`: select plus Other, with options like Ayah, Ibu, Suami/Istri, Anak, Saudara.**

**- `family\\\*\\\_occupation`: select plus Other.**

**- `lifestyle`: derived from alcohol, smoking, and tattoo fields.**

**- `drinks\\\_alcohol`, `smokes`, `has\\\_tattoo`: required Ya/Tidak selects.**

**- `lpk\\\_origin`: required configurable option list so choices can be added later.**

**- `lpk\\\_information`: derived from LPK origin.**

**- `japanese\\\_study\\\_hours`: required numeric input.**

**- `documents`: checklist plus mock upload using core LPK docs: KTP, KK, Ijazah, Paspor, Medical Checkup, Foto Profil.**

**- `physical\\\_test\\\_video`: required mock video upload.**

**- `additional\\\_files`: optional multi-upload with removable filename chips.**



**## Interfaces And Data**

**- Extend candidate form values with structured nested groups instead of only flat `additionalFields`.**

**- Keep compatibility by mapping structured UI values back into the existing mock candidate data and `additionalFields`.**

**- Add reusable config arrays for predetermined options: blood type, religion, marital status, passport status, school type, education level, majors, job roles, family relations, occupations, LPK origins, and document checklist.**

**- Add helper functions for uppercase formatting, age calculation, date-order validation, conditional row activation, and mock file state.**



**## Test Plan**

**- Run `typecheck` and `lint`.**

**- Verify draft save accepts incomplete sections.**

**- Verify final submit enforces required key fields and conditional rows.**

**- Verify name fields auto-uppercase.**

**- Verify calculated age updates from birth date and family birth dates.**

**- Verify predetermined selects render in Bahasa Indonesia and Other/free text paths work.**

**- Verify mock uploads show filenames/previews/chips without real upload.**

**- Verify accordion layout remains usable on desktop and mobile widths.**



**## Assumptions**

**- This remains frontend-only: no backend, no real file storage, no API routes.**

**- “Capital” means UPPERCASE.**

**- LPK origin choices are configurable in frontend constants for now.**

**- Existing admin CRM surfaces should keep working; the rebuild targets the candidate form UI only.**

