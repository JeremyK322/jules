# Lunar Constraint Map (LCM)

The **Lunar Constraint Map (LCM)** is an interactive, browser-based 3D WebGL governance and coordination instrument designed for visualizing spatial constraints, resource zones, active operational footprints, and regulatory statuses across the lunar surface and orbital domain.

Built around the legal framework of the **1967 Outer Space Treaty (OST)**—specifically Articles VI, IX, and XI—the LCM transitions lunar mapping from a static catalogue of restrictions into a living, real-time coordination tool for state parties, space agencies, commercial operators, and insurers.

---

## Key Objectives & Purpose

1. **Fixing the "Rush into Darkness" Problem:** Addresses the risk of uncoordinated lunar site claims by establishing a transparent, machine-readable dataset tracking confidence states, provisional protections, and assessment review windows.
2. **Operational Coordination (OST Article IX):** Real-time spatial overlap detection that identifies potential harmful interference between planned/active operations and existing physical, scientific, or heritage designations.
3. **State Party Responsibility (OST Article VI):** First-class provenance tracking linking surface features directly to responsible State Parties under international law.
4. **Information Sharing (OST Article XI):** Client-side static report generation producing auditable, high-resolution location and feature reports with embedded map canvas captures.

---

## Technical Architecture

The Lunar Constraint Map is designed as a standalone, zero-dependency frontend application:

- **`index.html`**: Main single-page WebGL application containing Three.js scene setup, camera controllers, custom shaders/materials, user interface panels, planning modal workflows, and canvas screenshot report generation.
- **`moonLayers.js`**: Core machine-readable schema (v2.0.0) defining resource layers (`LAYER_DEFS`), categories (`CATEGORIES`), tier definitions (`TIER_DEFS`), State Party definitions (`STATE_DEFS`), and feature datasets (`FEATURES`).
- **Rendering Stack**: Three.js (r160) utilizing `PerspectiveCamera`, `OrbitControls`, custom curved `SphereGeometry` surface slice meshes, and custom `LineDashedMaterial` and canvas texture shaders.

---

## Data Schema & Provenance

Every feature in the data model carries structured metadata as first-class fields:

- **`id`**: Machine-readable identifier.
- **`name`**: Human-readable designation name.
- **`lat` & `lon`**: Surface coordinates (degrees North/South and East/West). Omitted for orbital geometries.
- **`radius_km`**: Physical radius of the designation.
- **`tier`**: Constraint tier level (1, 2, or 3).
- **`source`**: Primary dataset or scientific reference.
- **`evidence_grade`**: Standardization of evidentiary rigor:
  - **`A`**: Direct measurement / peer-reviewed observational data.
  - **`B`**: Regulatory designation / official treaty framework.
  - **`C`**: Unverified assertion or preliminary estimate.
- **`review_status`**: Map confidence state (`unassessed`, `under_assessment`, `assessed_open`, `assessed_protected`).
- **`date`**: Assessment date (`YYYY-MM-DD` or `Pending`).
- **`event_date`**: Historical mission or landing date where applicable.
- **`designation_authority`**: Governing body or entity (e.g., IAU, ITU, NASA, CNSA).
- **`state`**: Responsible State Party under OST Article VI (e.g., `USA`, `China`, `Russia (successor to USSR under state succession)`).
- **`disputed`**: Boolean indicating active challenge in the dispute register.
- **`dispute_details`**: Object containing challenger entity, justification, and response deadline.

---

## Layer Structure & Categories

Features are organized into six top-level categories:

1. **Physical:** Natural geographical features (e.g., Shackleton Crater, Malapert Mountain).
2. **Extractable:** Resource-rich areas including Permanently Shadowed Regions (PSRs) and volatile deposits.
3. **Spatial:** Operational zones such as Near-Rectilinear Halo Orbits (NRHO) and far-side quiet zones.
4. **Environmental:** Sensitive scientific regions (e.g., Far Side Radio Quiet Zone protected under ITU RR Art. 22.22).
5. **Heritage:** Top-level historical category strictly reserving landing and impact sites of historical spacecraft (e.g., Apollo 11, Luna 2, Chang'e 4, Surveyor 1).
6. **Intangible:** Cultural and designated non-physical boundaries.

---

## Master Governance Overlays

The LCM features four master governance overlays that transform map interpretation:

### 1. Assessment Status & Provisional Protection Mode
- Recolors features by map confidence:
  - **Unassessed:** Gray outline with dashed border.
  - **Under Assessment:** Amber fill with pulsating provisional ring texture.
  - **Assessed Open:** Muted slate outline.
  - **Proposed Protected:** Solid slate fill.
- Sites under active assessment carry a provisional protection notice requiring public justification prior to proceeding during the review window.

### 2. Operational Activity Layer
- Displays active and planned surface missions (e.g., Artemis III Target Zones, Chang'e 6/7, VIPER).
- Renders operational activity radii and dynamically calculates spatial overlap with existing resource layers under Article IX due regard obligations.

### 3. Dynamic Harms Layer (Computed)
Generates procedural physical footprint models attached to operating assets:
- **Plume Surface Interaction (PSI-v1.2):** Rocket exhaust regolith ejecta impact zone.
- **Volatile Contamination (CONTAM-v1.0):** Outgassing deposition footprint.
- **Transient EMI (EMI-v1.1):** Electro-magnetic interference radius.

### 4. Disputes, Salience & Recency Overlay
- Highlights challenged designations with hatched white textures and displays challenger details and response deadlines.
- Adjusts visual weight based on evidence grade (Grade A rendered with higher opacity than Grade C).
- Flags designations updated within the last two years with recency markers.

---

## Interactive Features & Controls

### Globe Navigation
- **Rotate:** Click & drag with left mouse button.
- **Zoom:** Mouse scroll wheel. Dynamic sensitivity scales rotation speed with distance from min Distance (1.1) to max Distance (15.0).
- **Smooth Fly-To:** Clicking any feature item in the layer panel smoothly animates the camera using spherical quaternion interpolation (`slerpQuaternions`) with ease-in-out easing over ~3 seconds.

### Orbit Navigation
- Clicking an orbital feature (e.g. Gateway / NRHO Orbit) automatically smoothly zooms camera distance out to **6.500**, highlights orbital trajectory lines and animated satellite meshes, and generates reports omitting surface Lat/Lon.

### Settings Panel (Gear Icon)
- **Art. VI State Mode:** Recolors all surface features according to the color key of their responsible State Party.
- **Surface Click Selection:** Toggle switch (default OFF) to prevent accidental popups when clicking the 3D Moon surface. When enabled, clicking surface features opens the 4-field summary popup.
- **Info Debug Panel:** Displays distance, viewpoint lat/lon, sensitivity, and rotation state.
- **Lock N/S Pole:** Restricts camera rotation to the equatorial plane.
- **Auto-rotate:** Toggles continuous globe rotation.
- **Glow Opacity:** Slider to adjust feature disc transparency.
- **Crosshair:** Center targeting reticle.

### Planning Mode
- Click the **Plan** button to place a custom operational site at the camera's center focal point.
- Specify site name, operator, State Party, radius (km), color, and tier (1–3).
- Generates a real-time **OST Conflict Assessment Report** analyzing Article VI, IX, and XI implications against all existing features before confirming site placement.

### Static Report Generator
- Click **Report** on any feature popup or the bottom-left Telemetry HUD.
- Freezes WebGL state and captures a high-resolution PNG snapshot (`preserveDrawingBuffer: true`).
- Opens an auditable, printable report window containing:
  - High-res map capture.
  - Headline fields (Name, Category, Tier, Plain-language meaning).
  - Complete record audit trail (Source, Evidence grade, Assessment status, Dates, Authority, State responsibility, Disputes, Legal instrument).
  - Plain language summary.
  - Mandatory legal honesty footer disclaimer.

---

## How to Run Locally

Because the Lunar Constraint Map is a static WebGL application, no build steps or backend servers are required.

### Simple HTTP Server
Using Python:
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080/index.html` in any WebGL-enabled browser (Chrome, Firefox, Safari, Edge).

---

## License & Attribution

This instrument is rendered based on public astronomical gazetteers (IAU), international treaty frameworks (OST, ITU), and published scientific literature.

*Disclaimer: Absence from this map does not mean an area is free of constraint. This tool is a rendering of current records, not a formal legal determination.*
