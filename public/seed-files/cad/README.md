# CAD Seed Files

Synthetic CAD fixtures for OmniConvert browser upload and simulated conversion QA.

These files are intentionally tiny and contain no real project data. Text-based formats such as DXF, STL, OBJ, STEP, and IGES include minimal valid sample geometry. Proprietary binary-like formats such as DWG and DWF are sandbox placeholders used to exercise client-side file selection and route handling only.

Suggested smoke tests:

- `/cad/step-to-stl` with `sample-step-bracket.step`
- `/cad/obj-to-stl` with `sample-obj-cube.obj`
- `/cad/iges-to-step` with `sample-iges-plate.igs`
- `/cad/dwg-to-pdf` with `sample-dwg-floorplan.dwg`
