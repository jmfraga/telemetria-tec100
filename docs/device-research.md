# Investigacion de Dispositivos BLE para Telemetria

> Investigacion completada 2026-03-29. Evalua oximetros y baumanometros BLE para integracion
> con sistema de telemetria del Cancer Center Tec 100 (Queretaro).
>
> Criterios: BLE abierto/documentado, precision clinica, disponible en Mexico, monitoreo continuo.

---

## Resumen Ejecutivo

### Oximetro recomendado

| | Produccion | Desarrollo |
|---|---|---|
| **Modelo** | Wellue/Viatom O2Ring | Wellue/Viatom PC-60FW |
| **Precio MX** | ~$2,500-3,500 MXN | ~$500-1,000 MXN |
| **Precision** | ±2% SpO2, ±2 bpm | ±1.77% ARMS SpO2, ±2 bpm |
| **Forma** | Anillo (comodo para quimio) | Clip de dedo |
| **Continuo** | Si (12-16 hrs) | Si (spot-check + continuo) |
| **BLE** | Propietario Viatom (reverse-engineered) | Nordic UART Service (mejor documentado) |
| **Disponible MX** | Amazon.com.mx, MercadoLibre | Amazon.com.mx |

### Baumanometro recomendado

| | Principal | Alternativa |
|---|---|---|
| **Modelo** | Omron HEM-7155T (X4 Smart) | Omron HEM-7600T (Evolv) |
| **Precio MX** | ~$986 MXN | ~$473+ MXN (variable) |
| **BLE** | Dual: estandar BLP + propietario Omron | Dual: estandar BLP + propietario Omron |
| **omblepy** | Soporte completo | Soporte completo |
| **Validacion** | ISO 81060-2, diabetes, embarazo | ISO 81060-2 |
| **Disponible MX** | Amazon.com.mx, farmacias | Amazon.com.mx |

---

## 1. Oximetros de Pulso BLE

### 1.1 Hallazgo critico: Ningun oximetro usa el estandar GATT PLX

El Bluetooth SIG define el Pulse Oximeter Profile (PLXP v1.0.1):
- Service UUID: `0x1822`
- PLX Continuous Measurement: `0x2A5F`
- PLX Spot-Check: `0x2A5E`

**Casi ningun oximetro comercial implementa este estandar.** Todos usan protocolos propietarios o semi-propietarios. Esto es el mayor reto para integracion BLE.

### 1.2 Tabla comparativa de oximetros

| Caracteristica | Wellue O2Ring | Wellue PC-60FW | BerryMed BM1000C | Contec CMS50D-BT | Masimo MightySat Rx |
|---|---|---|---|---|---|
| **Forma** | Anillo | Clip de dedo | Clip de dedo | Clip de dedo | Clip de dedo |
| **BLE** | Propietario Viatom | Nordic UART (NUS) | Custom vendor UART | Custom propietario | Cerrado, solo app Masimo |
| **GATT PLX (0x1822)?** | No | No | No | No | No |
| **bleak compatible?** | Si (reverse-engineered) | Si (driver completo) | Si (Adafruit lib) | Si (driver basico) | **No** |
| **Monitoreo continuo?** | Si (12-16 hrs) | Si | No (spot-check) | Limitado | Spot-check |
| **FDA cleared?** | Si | Si (510(k) K191088) | Si (510(k) K172141) | Si | Si |
| **CE certified?** | Si | Si | Si | Si | Si |
| **Precision SpO2** | ±2% (70-100%) | ±1.77% ARMS | ±1.50% ARMS | ±4% | ±2% (SET, gold standard) |
| **Precision HR** | ±2 bpm | ±2 bpm | ±2 bpm | ±2 bpm | ±1 bpm |
| **Perfusion Index** | Si | Si (0-20%) | Si (0.5-20%) | No especificado | Si (PI + PVi) |
| **Baja perfusion** | Reporta PI | Reporta PI | Rated 0.5% PI | No testeado | Mejor en clase (PI <0.02%) |
| **Precio** | $130-180 USD | $26-50 USD | $12-30 USD | $40-80 USD | $300-500 USD |
| **En Mexico?** | Si (Amazon/ML) | Si (Amazon) | No directamente | BT dificil de encontrar | Si (dist. medicos) |

### 1.3 Wellue/Viatom O2Ring (recomendado para produccion)

**Por que para oncologia:**
- Forma de anillo: comodo para horas de infusion de quimioterapia
- Alarma por vibracion ante SpO2 bajo
- Bateria 12-16 hrs cubre sesiones completas de quimio
- ±2% SpO2 con FDA registration

**Protocolo BLE:**
- Protocolo propietario Viatom (reverse-engineered)
- Packet format: sync word + command + CRC8
- Datos cada 2-4 segundos
- Requiere modo Standby para aceptar conexiones BLE

**Proyectos open-source:**
- [ecostech/viatom-ble](https://github.com/ecostech/viatom-ble) — lee cada 2s, soporta MQTT, bluepy
- [MackeyStingray/o2r](https://github.com/MackeyStingray/o2r) — bleak, descarga + configura
- [farolone/wellue-o2ring-protocol](https://github.com/farolone/wellue-o2ring-protocol) — docs del protocolo

**Disponibilidad Mexico:**
- Amazon.com.mx: ~$2,500-3,500 MXN
- MercadoLibre: multiples vendedores

### 1.4 Wellue/Viatom PC-60FW (recomendado para desarrollo)

**Por que para desarrollo:**
- Protocolo BLE mejor documentado de todos los candidatos
- Usa Nordic UART Service (NUS) — mas amigable que custom GATT
- Driver bleak completo ya existe
- Mas barato ($26-50 USD)
- Misma familia Viatom que O2Ring — codigo comparte overlap significativo

**Protocolo BLE:**
- Nordic UART Service (NUS)
- TX characteristic (Notify): SpO2, Pulse Rate, PI, waveform
- Packet: sync `[0xAA, 0x55]`, length, payload, CRC8 (Maxim)
- Tipos: datos numericos (SpO2/HR/PI) y waveform (PPG) en paquetes separados

**Proyecto open-source:**
- [sza2/viatom_pc60fw](https://github.com/sza2/viatom_pc60fw) — implementacion bleak completa

**Disponibilidad Mexico:**
- Amazon.com.mx: listado como "Wellue PC-60FW"

### 1.5 Masimo MightySat Rx (descartado)

**Por que NO funciona para integracion custom:**
1. BLE completamente propietario — comunicacion restringida a Masimo Professional Health App
2. Sin SDK/API — Masimo no ofrece documentacion ni acceso para terceros
3. Pairing exclusivo — solo se empareja con un smart device a la vez
4. Ecosistema cerrado — todos los datos fluyen por app de Masimo
5. Sin reverse engineering — no hay repos de GitHub que hayan crackeado el protocolo
6. Riesgo legal — Masimo es notoriamente litigioso (demandas de patentes vs Apple)

**Clinicamente superior** (SET technology, PI <0.02%, gold standard para baja perfusion), pero tecnicamente imposible para integracion BLE custom.

### 1.6 Contec CMS50D-BT (descartado)

- **±4% SpO2** — precision inaceptable para oncologia
- Variante BT dificil de encontrar en Mexico
- Sin testing de baja perfusion documentado

### 1.7 BerryMed BM1000C (descartado)

- Spot-check only — no soporta monitoreo continuo
- No disponible directamente en Mexico
- Buena precision pero limitado a mediciones puntuales

---

## 2. Baumanometros BLE

### 2.1 Protocolo estandar BLE Blood Pressure

El Bluetooth SIG define el Blood Pressure Profile (BLP):
- Service UUID: `0x1810`
- Blood Pressure Measurement: `0x2A35`
- Blood Pressure Feature: `0x2A49`

**Los Omron si implementan este estandar** (ademas de su protocolo propietario). Esto es una ventaja significativa vs oximetros.

**Formato de bytes (0x2A35):**

| Byte(s) | Campo | Formato |
|---------|-------|---------|
| 0 | Flags | uint8 (bit 0: unidades, bit 1: timestamp, bit 2: pulse) |
| 1-2 | Sistolica (mmHg) | SFLOAT (IEEE 11073) |
| 3-4 | Diastolica (mmHg) | SFLOAT |
| 5-6 | Presion arterial media | SFLOAT |
| 7-13 | Timestamp | DateTime (7 bytes, opcional) |
| 14-15 | Pulse Rate | SFLOAT (opcional) |

### 2.2 Omron HEM-9200T (descartado)

El HEM-9200T originalmente propuesto tiene problemas:
- **No disponible en Mexico** — solo canal B2B telehealth en EE.UU.
- No se conecta a Omron Connect — diseñado para receptores telehealth dedicados
- No soportado por omblepy
- Precio: ~$222 USD solo via distribuidores medicos de EE.UU.

### 2.3 Modelos Omron disponibles en Mexico con BLE

| Modelo | Nombre | Precio MXN | omblepy | Memorias | Notas |
|--------|--------|-----------|---------|----------|-------|
| **HEM-7155T** | **X4 Smart** | ~$986 | **Completo** | 60 x 2 usuarios | Validado diabetes/embarazo |
| **HEM-7600T** | **Evolv** | ~$473+ | **Completo** | 100 x 1 usuario | Tubeless, compacto |
| HEM-7322T | M700 Intelli IT | Disponible | **Completo** | 100 x 2 usuarios | Intelli Wrap 360 |
| HEM-7156T | 7156T | ~$859-1,173 | No | - | Budget, Omron Connect |
| HEM-7144T | 7144T | ~$773-1,141 | No | - | Budget, BT basico |
| HEM-6232T | RS7 Intelli IT | Disponible | Si | - | **Muñeca** — menos preciso para hospital |

### 2.4 Omron HEM-7155T / X4 Smart (recomendado)

**Por que:**
1. Disponible en Amazon.com.mx (~$986 MXN) y farmacias mexicanas
2. Soporte omblepy completo (pairing, lectura, contador, time sync)
3. Dual BLE: expone estandar `0x1810`/`0x2A35` + protocolo propietario Omron
4. Validado clinicamente: ISO 81060-2, diabetes, embarazo, pre-eclampsia, enfermedad renal
5. Brazalete Intelli Wrap (22-42 cm) — preciso en cualquier posicion
6. 60 registros x 2 usuarios
7. Compatible con Omron Connect (pacientes pueden usar app oficial tambien)
8. Distribucion COFEPRIS-compliant via canales oficiales en Mexico

### 2.5 Como funciona omblepy (detalles tecnicos)

**Repositorio:** https://github.com/userx14/omblepy

**Pairing:**
1. Intercambio de clave de 16 bytes via characteristic de unlock (`b305b680-aee7-11e1-a730-0002a5d5c51b`)
2. Clave arbitraria (default: `deadbeaf12341234deadbeaf12341234`)
3. Trigger SMP Security Request para BLE bonding

**Lectura de datos (protocolo EEPROM propietario):**
- UUIDs custom basados en `ecbe3980-c9a2-11e1-b1bd-0002a5d5c51b`
- 4 canales TX + 4 RX + 1 unlock para transferencia paralela
- Comandos: start (`0x0000`), read EEPROM (`0x0100`), write EEPROM (`0x01c0`), end (`0x0f00`)
- Formato de registro HEM-7155T (14 bytes, big-endian):
  - dia: bits 0-7
  - sys: bits 8-15 + 25 (offset encoded)
  - year: bits 16-23 + 2000
  - bpm: bits 24-31
  - mov (movimiento): bit 32
  - ihb (irregular heartbeat): bit 33
  - mes, dia, hora, minuto, segundo en bits restantes

**Lectura estandar BLP (real-time, via open-BPM):**
```python
# Subscribe to standard BLE BP Measurement characteristic
device.subscribe(
    "00002a35-0000-1000-8000-00805f9b34fb",
    callback=handle_value,
    indication=True,
)
# Recibe datos durante/inmediatamente despues de medicion (~1 min antes de sleep)
```

**Plataformas:** Windows, Linux, macOS, Raspberry Pi 4/5, ESP32 bridge
**Dependencias:** Python 3, bleak

---

## 3. Estrategia de Integracion Recomendada

### Para oximetros (Wellue O2Ring / PC-60FW)

```
Fase desarrollo: PC-60FW con bleak (driver sza2/viatom_pc60fw)
                    ↓
                Port protocolo a O2Ring (misma familia Viatom)
                    ↓
Fase produccion: O2Ring en cada cama (continuo, anillo comodo)
```

- Ambos dispositivos usan familia de protocolos Viatom
- Codigo de integracion comparte overlap significativo
- PC-60FW tiene el driver bleak mas completo y documentado
- O2Ring requiere adaptar para su protocolo especifico (docs reverse-engineered disponibles)

### Para baumanometros (Omron HEM-7155T)

Dos paths de integracion, usar ambos:

**Path A: Standard BLP (real-time)**
- Subscribe a `0x2A35` bajo `0x1810` via bleak
- Recibe medicion cuando el paciente se la toma
- Requiere estar conectado durante medicion
- Formato estandarizado SFLOAT

**Path B: Omron EEPROM via omblepy (batch)**
- Lee registros almacenados en dispositivo
- Hasta 60 mediciones almacenadas
- Poll periodico para recuperar nuevos registros
- Robusto ante desconexiones BLE temporales

**Recomendacion:** Usar Path A como primario (real-time), Path B como fallback/recovery.

### Nota sobre baja perfusion en quimioterapia

Ningun oximetro BLE consumer esta especificamente validado para baja perfusion por quimioterapia. Masimo SET es el unico con performance probado a PI <0.02%, pero no es integrable.

**Mitigacion por software:** Usar el valor de Perfusion Index (reportado por O2Ring y PC-60FW) como indicador de confianza. Cuando PI es bajo, flagear la lectura como potencialmente poco confiable y alertar al personal clinico. Esto compensa limitaciones del hardware con inteligencia en software.

---

## 4. Costos Actualizados

### Piloto (2 pacientes)

| Dispositivo | Cantidad | Precio unitario | Total |
|------------|----------|----------------|-------|
| Wellue O2Ring | 2 | ~$3,000 MXN | ~$6,000 MXN |
| Omron HEM-7155T | 2 | ~$986 MXN | ~$1,972 MXN |
| Wellue PC-60FW (desarrollo) | 1 | ~$800 MXN | ~$800 MXN |
| **Total piloto** | | | **~$8,772 MXN** |

### Produccion (12 pacientes)

| Dispositivo | Cantidad | Precio unitario | Total |
|------------|----------|----------------|-------|
| Wellue O2Ring | 12 | ~$3,000 MXN | ~$36,000 MXN |
| Omron HEM-7155T | 12 | ~$986 MXN | ~$11,832 MXN |
| **Total produccion** | | | **~$47,832 MXN** |

---

## 5. Proyectos Open-Source de Referencia

| Proyecto | URL | Descripcion |
|----------|-----|-------------|
| viatom_pc60fw | github.com/sza2/viatom_pc60fw | Driver bleak completo para PC-60FW |
| viatom-ble | github.com/ecostech/viatom-ble | O2Ring/PO series, MQTT |
| o2r | github.com/MackeyStingray/o2r | O2Ring bleak, descarga + config |
| wellue-o2ring-protocol | github.com/farolone/wellue-o2ring-protocol | Protocolo reverse-engineered |
| omblepy | github.com/userx14/omblepy | Driver Omron BLE completo |
| open-BPM | github.com/evnleong/open-BPM | Omron via standard BLP |
| BCI_Protocol | github.com/zh2x/BCI_Protocol | Referencia protocolo BerryMed |

---

## 6. Siguiente Paso: Validacion Practica

Antes de comprar hardware para el piloto:

1. Comprar 1 x Wellue PC-60FW (~$800 MXN) en Amazon.com.mx
2. Ejecutar `viatom_pc60fw` con bleak en la laptop
3. Validar: conexion, estabilidad, formato de datos, latencia
4. Si funciona: comprar 1 x O2Ring y adaptar driver
5. Comprar 1 x Omron HEM-7155T en Amazon.com.mx
6. Ejecutar omblepy: pairing, lectura de registros
7. Probar tambien standard BLP real-time (0x2A35)
8. Documentar resultados en este archivo

**Presupuesto validacion: ~$1,786 MXN (~$89 USD)**
