'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Circle,
  Image as KonvaImage,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
  Transformer,
} from 'react-konva';

import {
  Circle as CircleIcon,
  Image as ImageIcon,
  QrCode,
  Redo2,
  Save,
  Square,
  Trash2,
  Type,
  Undo2,
} from 'lucide-react';

import {
  FONT_FAMILIES,
  genElementId,
  getCanvasPx,
} from '../../lib/cardDimensions';

/* -------------------------------------------------------------------------- */
/*                                   CONSTANTS                                */
/* -------------------------------------------------------------------------- */

const IMAGE_TYPES = ['image', 'file', 'url'];

const DEFAULT_BACKGROUND = {
  type: 'color',
  value: '#ffffff',
};

const DEFAULT_SIDE = {
  background: DEFAULT_BACKGROUND,
  elements: [],
};

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

const createInitialElement = (type, fieldName = '') => {
  const isImage = type.includes('image');
  const isQRCode = type === 'qr_code';
  const isLine = type === 'shape_line';

  return {
    id: genElementId(),
    type,
    fieldName,

    x: 30,
    y: 30,

    width: isImage || isQRCode ? 100 : 180,

    height:
      isImage || isQRCode
        ? 100
        : isLine
          ? 3
          : 40,

    rotation: 0,
    zIndex: Date.now(),
    opacity: 1,

    content: type === 'static_text' ? 'Text' : '',

    fill: '#cbd5e1',
    stroke: '#334155',
    strokeWidth: 0,

    style: {
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#111827',
      textAlign: 'left',
    },

    fallbackBehavior: 'fallback',
    fallbackValue: 'N/A',

    objectFit: 'cover',

    errorCorrectionLevel: 'M',
    qrMargin: 4,
  };
};

/* -------------------------------------------------------------------------- */
/*                              CUSTOM IMAGE HOOK                             */
/* -------------------------------------------------------------------------- */

function useLoadedImage(src) {
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!src) return undefined;

    const img = new window.Image();

    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setImage(img);
    };

    img.onerror = () => {
      setImage(null);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return image;
}

/* -------------------------------------------------------------------------- */
/*                               ELEMENT NODE                                 */
/* -------------------------------------------------------------------------- */

function ElementNode({
  el,
  selected,
  onSelect,
  onChange,
}) {
  const image = useLoadedImage(
    el.type === 'static_image' ? el.src : ''
  );

  const handleDragEnd = (event) => {
    onChange({
      x: event.target.x(),
      y: event.target.y(),
    });
  };

  const handleTransformEnd = (event) => {
    const node = event.target;

    const width = Math.max(
      5,
      node.width() * node.scaleX()
    );

    const height = Math.max(
      5,
      node.height() * node.scaleY()
    );

    onChange({
      x: node.x(),
      y: node.y(),
      width,
      height,
      rotation: node.rotation(),
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  const commonProps = {
    id: el.id,
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,

    rotation: el.rotation || 0,
    opacity: el.opacity ?? 1,

    draggable: !el.locked,

    onClick: onSelect,
    onTap: onSelect,

    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
  };

  /* --------------------------------- TEXT --------------------------------- */

  if (
    el.type === 'static_text' ||
    el.type === 'dynamic_text'
  ) {
    const text =
      el.type === 'dynamic_text'
        ? `${el.prefix || ''}{{${el.fieldName}}}${el.suffix || ''}`
        : el.content;

    return (
      <Text
        {...commonProps}
        text={text}
        fontSize={el.style?.fontSize || 16}
        fontFamily={el.style?.fontFamily || 'Arial'}
        fontStyle={
          el.style?.fontWeight === 'bold'
            ? 'bold'
            : 'normal'
        }
        fill={el.style?.color || '#111827'}
        align={el.style?.textAlign || 'left'}
      />
    );
  }

  /* ----------------------------- STATIC IMAGE ----------------------------- */

  if (
    el.type === 'static_image' &&
    image
  ) {
    return (
      <KonvaImage
        {...commonProps}
        image={image}
      />
    );
  }

  /* ---------------------------- IMAGE PLACEHOLDER -------------------------- */

  if (
    el.type === 'static_image' ||
    el.type === 'dynamic_image'
  ) {
    return (
      <Rect
        {...commonProps}
        fill="#e2e8f0"
        stroke="#64748b"
        dash={[5, 4]}
      />
    );
  }

  /* -------------------------------- CIRCLE -------------------------------- */

  if (el.type === 'shape_circle') {
    const radius =
      Math.min(el.width, el.height) / 2;

    return (
      <Circle
        {...commonProps}
        radius={radius}
        offsetX={-radius}
        offsetY={-radius}
        fill={el.fill}
        stroke={el.stroke}
        strokeWidth={el.strokeWidth || 0}
      />
    );
  }

  /* --------------------------------- LINE --------------------------------- */

  if (el.type === 'shape_line') {
    return (
      <Line
        {...commonProps}
        points={[0, 0, el.width, 0]}
        stroke={el.stroke}
        strokeWidth={el.strokeWidth || 2}
      />
    );
  }

  /* ----------------------------- QR PLACEHOLDER ---------------------------- */

  if (el.type === 'qr_code') {
    return (
      <>
        <Rect
          {...commonProps}
          fill="white"
          stroke="#111827"
        />

        <Text
          x={el.x}
          y={el.y + el.height / 2 - 8}
          width={el.width}
          text="QR"
          align="center"
          fontStyle="bold"
          fill="#334155"
        />
      </>
    );
  }

  /* ------------------------------ RECTANGLE ------------------------------- */

  return (
    <Rect
      {...commonProps}
      fill={el.fill}
      stroke={el.stroke}
      strokeWidth={el.strokeWidth || 0}
      cornerRadius={el.borderRadius || 0}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export default function IDCardDesigner({
  template,
  fields = [],
  onSave,
  saving,
}) {
  const [activeSide, setActiveSide] =
    useState('front');

  const [design, setDesign] =
    useState(template);

  const [selected, setSelected] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [future, setFuture] =
    useState([]);

  const transformerRef = useRef(null);
  const stageRef = useRef(null);

  /* ------------------------------ CURRENT SIDE ----------------------------- */

  const side =
    design?.[activeSide] || DEFAULT_SIDE;

  const canvas = useMemo(() => {
    return getCanvasPx(design || {});
  }, [design]);

  const selectedElement =
    side.elements.find(
      (element) => element.id === selected
    );

  /* -------------------------- TRANSFORMER HANDLING ------------------------- */

  useEffect(() => {
    if (
      !transformerRef.current ||
      !stageRef.current
    ) {
      return;
    }

    const node =
      selected &&
      stageRef.current.findOne(
        `#${selected}`
      );

    transformerRef.current.nodes(
      node ? [node] : []
    );

    transformerRef.current
      .getLayer()
      ?.batchDraw();
  }, [selected, side.elements]);

  /* ------------------------------ UPDATE DESIGN ---------------------------- */

  const updateDesign = useCallback(
    (nextDesign, track = true) => {
      if (track) {
        setHistory((previousHistory) => [
          ...previousHistory.slice(-29),
          design,
        ]);

        setFuture([]);
      }

      setDesign(nextDesign);
    },
    [design]
  );

  /* ------------------------------ UPDATE SIDE ------------------------------ */

  const patchSide = useCallback(
    (callback) => {
      updateDesign({
        ...design,
        [activeSide]: callback(side),
      });
    },
    [
      activeSide,
      design,
      side,
      updateDesign,
    ]
  );

  /* ---------------------------- UPDATE ELEMENT ----------------------------- */

  const patchElement = useCallback(
    (id, patch) => {
      patchSide((currentSide) => ({
        ...currentSide,

        elements:
          currentSide.elements.map(
            (element) => {
              if (element.id !== id) {
                return element;
              }

              return {
                ...element,
                ...patch,

                style: patch.style
                  ? {
                    ...element.style,
                    ...patch.style,
                  }
                  : element.style,
              };
            }
          ),
      }));
    },
    [patchSide]
  );

  /* ------------------------------ ADD ELEMENT ------------------------------ */

  const addElement = useCallback(
    (type, fieldName = '') => {
      const element =
        createInitialElement(
          type,
          fieldName
        );

      patchSide((currentSide) => ({
        ...currentSide,

        elements: [
          ...currentSide.elements,
          element,
        ],
      }));

      setSelected(element.id);
    },
    [patchSide]
  );

  /* ---------------------------------- UNDO --------------------------------- */

  const undo = () => {
    const previousDesign =
      history.at(-1);

    if (!previousDesign) {
      return;
    }

    setFuture((previousFuture) => [
      design,
      ...previousFuture,
    ]);

    setHistory((previousHistory) =>
      previousHistory.slice(0, -1)
    );

    setDesign(previousDesign);
  };

  /* ---------------------------------- REDO --------------------------------- */

  const redo = () => {
    const nextDesign = future[0];

    if (!nextDesign) {
      return;
    }

    setHistory((previousHistory) => [
      ...previousHistory,
      design,
    ]);

    setFuture((previousFuture) =>
      previousFuture.slice(1)
    );

    setDesign(nextDesign);
  };

  /* ----------------------------- DELETE ELEMENT ---------------------------- */

  const deleteElement = useCallback(
    (id) => {
      patchSide((currentSide) => ({
        ...currentSide,

        elements:
          currentSide.elements.filter(
            (element) => element.id !== id
          ),
      }));

      setSelected(null);
    },
    [patchSide]
  );

  /* ---------------------------- KEYBOARD SHORTCUTS ------------------------- */

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isDuplicateShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'd';

      if (
        isDuplicateShortcut &&
        selectedElement
      ) {
        event.preventDefault();

        const duplicate = {
          ...selectedElement,

          id: genElementId(),

          x: selectedElement.x + 12,
          y: selectedElement.y + 12,
        };

        patchSide((currentSide) => ({
          ...currentSide,

          elements: [
            ...currentSide.elements,
            duplicate,
          ],
        }));

        setSelected(duplicate.id);

        return;
      }

      const isDeleteKey =
        event.key === 'Delete' ||
        event.key === 'Backspace';

      if (
        isDeleteKey &&
        selected
      ) {
        deleteElement(selected);
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    selected,
    selectedElement,
    patchSide,
    deleteElement,
  ]);

  /* ------------------------------- NO DESIGN ------------------------------- */

  if (!design) {
    return null;
  }

  /* ------------------------------ BACK SIDE -------------------------------- */

  const handleBackSide = () => {
    if (design.back) {
      setActiveSide('back');
      return;
    }

    updateDesign({
      ...design,

      back: {
        background:
          DEFAULT_BACKGROUND,

        elements: [],
      },

      hasBack: true,
    });

    setActiveSide('back');
  };

  const deleteBackSide = () => {
    updateDesign({
      ...design,
      back: null,
      hasBack: false,
    });

    setActiveSide('front');
  };

  /* ------------------------------------------------------------------------ */
  /*                                   UI                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-4">
      {/* ============================== TOOLBAR ============================== */}

      <div className="flex flex-wrap justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
        {/* SIDES */}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setActiveSide('front')
            }
            className={`rounded-lg px-3 py-2 text-sm ${activeSide === 'front'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400'
              }`}
          >
            Front
          </button>

          <button
            type="button"
            onClick={handleBackSide}
            className={`rounded-lg px-3 py-2 text-sm ${activeSide === 'back'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400'
              }`}
          >
            {design.back
              ? 'Back'
              : 'Create back'}
          </button>

          {design.back && (
            <button
              type="button"
              onClick={deleteBackSide}
              className="px-2 text-xs text-red-400"
            >
              Delete back
            </button>
          )}
        </div>

        {/* ACTIONS */}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={!history.length}
            className="p-2 text-slate-300 disabled:opacity-30"
            title="Undo"
          >
            <Undo2 size={18} />
          </button>

          <button
            type="button"
            onClick={redo}
            disabled={!future.length}
            className="p-2 text-slate-300 disabled:opacity-30"
            title="Redo"
          >
            <Redo2 size={18} />
          </button>

          <button
            type="button"
            onClick={() => onSave(design)}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            <Save size={16} />

            {saving
              ? 'Saving…'
              : 'Save draft'}
          </button>
        </div>
      </div>

      {/* ============================== DESIGNER ============================= */}

      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_270px]">
        {/* =========================== LEFT SIDEBAR ========================== */}

        <aside className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
          <p className="mb-3 text-xs font-semibold uppercase text-slate-500">
            Add elements
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              [Type, 'static_text', 'Text'],
              [
                ImageIcon,
                'static_image',
                'Image',
              ],
              [
                Square,
                'shape_rect',
                'Rect',
              ],
              [
                CircleIcon,
                'shape_circle',
                'Circle',
              ],
              [
                QrCode,
                'qr_code',
                'QR',
              ],
            ].map(
              ([Icon, type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    addElement(type)
                  }
                  className="rounded-lg bg-slate-800 p-2 text-xs text-slate-300 hover:bg-slate-700"
                >
                  <Icon
                    size={16}
                    className="mx-auto mb-1"
                  />

                  {label}
                </button>
              )
            )}
          </div>

          {/* CATALOG FIELDS */}

          <p className="mb-2 mt-5 text-xs font-semibold uppercase text-slate-500">
            Catalog fields
          </p>

          {fields.map((field) => {
            const elementType =
              IMAGE_TYPES.includes(field.type)
                ? 'dynamic_image'
                : 'dynamic_text';

            return (
              <button
                key={field._id}
                type="button"
                onClick={() =>
                  addElement(
                    elementType,
                    field.name
                  )
                }
                className="mb-1 w-full rounded px-2 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-800"
              >
                {field.label}{' '}

                <span className="text-slate-500">
                  ({field.type})
                </span>
              </button>
            );
          })}
        </aside>

        {/* ============================== CANVAS ============================= */}

        <main className="overflow-auto rounded-xl border border-slate-800 bg-slate-900/30 p-6">
          <div className="mx-auto w-max">
            <Stage
              ref={stageRef}
              width={canvas.width}
              height={canvas.height}
              onMouseDown={(event) => {
                if (
                  event.target ===
                  event.target.getStage()
                ) {
                  setSelected(null);
                }
              }}
            >
              <Layer>
                {/* BACKGROUND */}

                <Rect
                  width={canvas.width}
                  height={canvas.height}
                  fill={
                    side.background?.type ===
                      'color'
                      ? side.background.value
                      : '#ffffff'
                  }
                />

                {/* ELEMENTS */}

                {side.elements.map(
                  (element) => (
                    <ElementNode
                      key={element.id}
                      el={element}
                      selected={
                        selected === element.id
                      }
                      onSelect={() =>
                        setSelected(
                          element.id
                        )
                      }
                      onChange={(patch) =>
                        patchElement(
                          element.id,
                          patch
                        )
                      }
                    />
                  )
                )}

                {/* TRANSFORMER */}

                <Transformer
                  ref={transformerRef}
                  rotateEnabled
                  enabledAnchors={[
                    'top-left',
                    'top-right',
                    'bottom-left',
                    'bottom-right',
                  ]}
                />
              </Layer>
            </Stage>
          </div>
        </main>

        {/* ========================== RIGHT SIDEBAR ========================== */}

        <aside className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-sm">
          {selectedElement ? (
            <Properties
              element={selectedElement}
              fields={fields}
              onChange={(patch) =>
                patchElement(
                  selectedElement.id,
                  patch
                )
              }
              onDelete={() =>
                deleteElement(
                  selectedElement.id
                )
              }
            />
          ) : (
            <Background
              side={side}
              onChange={(patch) =>
                patchSide(
                  (currentSide) => ({
                    ...currentSide,

                    background: {
                      ...currentSide.background,
                      ...patch,
                    },
                  })
                )
              }
            />
          )}
        </aside>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           BACKGROUND COMPONENT                             */
/* -------------------------------------------------------------------------- */

function Background({
  side,
  onChange,
}) {
  const background =
    side.background || DEFAULT_BACKGROUND;

  return (
    <>
      <h3 className="mb-3 font-semibold">
        Background
      </h3>

      {/* COLOR */}

      <label className="block text-xs text-slate-400">
        Color

        <input
          type="color"
          value={
            background.type === 'color'
              ? background.value
              : '#ffffff'
          }
          onChange={(event) =>
            onChange({
              type: 'color',
              value: event.target.value,
            })
          }
          className="mt-1 block h-9 w-full"
        />
      </label>

      {/* IMAGE */}

      <label className="mt-3 block text-xs text-slate-400">
        Image URL

        <input
          type="url"
          value={
            background.type === 'image'
              ? background.value
              : ''
          }
          onChange={(event) =>
            onChange({
              type: 'image',
              value: event.target.value,
            })
          }
          className="mt-1 w-full rounded bg-slate-800 p-2 text-slate-100"
          placeholder="https://..."
        />
      </label>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                           PROPERTIES COMPONENT                             */
/* -------------------------------------------------------------------------- */

function Properties({
  element,
  fields,
  onChange,
  onDelete,
}) {
  const setProperty = (
    key,
    value
  ) => {
    onChange({
      [key]: value,
    });
  };

  const numericProperties = [
    'x',
    'y',
    'width',
    'height',
    'rotation',
    'opacity',
  ];

  const isText =
    element.type === 'static_text' ||
    element.type === 'dynamic_text';

  const isDynamic =
    element.type.includes('dynamic');

  return (
    <>
      {/* HEADER */}

      <div className="mb-3 flex justify-between">
        <h3 className="font-semibold">
          Properties
        </h3>

        <button
          type="button"
          onClick={onDelete}
          className="text-red-400 hover:text-red-300"
          title="Delete element"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* POSITION & SIZE */}

      <div className="grid grid-cols-2 gap-2">
        {numericProperties.map((key) => (
          <label
            key={key}
            className="text-xs text-slate-400"
          >
            {key}

            <input
              type="number"
              step="any"
              value={
                element[key] ?? ''
              }
              onChange={(event) =>
                setProperty(
                  key,
                  Number(
                    event.target.value
                  )
                )
              }
              className="mt-1 w-full rounded bg-slate-800 p-1.5 text-slate-100"
            />
          </label>
        ))}
      </div>

      {/* STATIC TEXT */}

      {element.type ===
        'static_text' && (
          <label className="mt-3 block text-xs text-slate-400">
            Text

            <input
              value={
                element.content || ''
              }
              onChange={(event) =>
                setProperty(
                  'content',
                  event.target.value
                )
              }
              className="mt-1 w-full rounded bg-slate-800 p-2 text-slate-100"
            />
          </label>
        )}

      {/* DYNAMIC FIELD */}

      {isDynamic && (
        <label className="mt-3 block text-xs text-slate-400">
          Field

          <select
            value={
              element.fieldName || ''
            }
            onChange={(event) =>
              setProperty(
                'fieldName',
                event.target.value
              )
            }
            className="mt-1 w-full rounded bg-slate-800 p-2 text-slate-100"
          >
            {fields.map((field) => (
              <option
                key={field._id}
                value={field.name}
              >
                {field.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* TEXT SETTINGS */}

      {isText && (
        <>
          <label className="mt-3 block text-xs text-slate-400">
            Font size

            <input
              type="number"
              min="1"
              value={
                element.style?.fontSize ||
                16
              }
              onChange={(event) =>
                onChange({
                  style: {
                    fontSize: Number(
                      event.target.value
                    ),
                  },
                })
              }
              className="mt-1 w-full rounded bg-slate-800 p-2 text-slate-100"
            />
          </label>

          <label className="mt-3 block text-xs text-slate-400">
            Font family

            <select
              value={
                element.style
                  ?.fontFamily || 'Arial'
              }
              onChange={(event) =>
                onChange({
                  style: {
                    fontFamily:
                      event.target.value,
                  },
                })
              }
              className="mt-1 w-full rounded bg-slate-800 p-2 text-slate-100"
            >
              {(FONT_FAMILIES || [
                'Arial',
                'Helvetica',
                'Times New Roman',
              ]).map((font) => (
                <option
                  key={font}
                  value={font}
                >
                  {font}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-3 block text-xs text-slate-400">
            Text color

            <input
              type="color"
              value={
                element.style?.color ||
                '#111827'
              }
              onChange={(event) =>
                onChange({
                  style: {
                    color:
                      event.target.value,
                  },
                })
              }
              className="mt-1 block h-8 w-full"
            />
          </label>

          <label className="mt-3 block text-xs text-slate-400">
            Text align

            <select
              value={
                element.style
                  ?.textAlign || 'left'
              }
              onChange={(event) =>
                onChange({
                  style: {
                    textAlign:
                      event.target.value,
                  },
                })
              }
              className="mt-1 w-full rounded bg-slate-800 p-2 text-slate-100"
            >
              <option value="left">
                Left
              </option>

              <option value="center">
                Center
              </option>

              <option value="right">
                Right
              </option>
            </select>
          </label>

          <label className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={
                element.style
                  ?.fontWeight === 'bold'
              }
              onChange={(event) =>
                onChange({
                  style: {
                    fontWeight:
                      event.target.checked
                        ? 'bold'
                        : 'normal',
                  },
                })
              }
            />

            Bold text
          </label>
        </>
      )}

      {/* STATIC IMAGE */}

      {element.type ===
        'static_image' && (
          <label className="mt-3 block text-xs text-slate-400">
            Image URL

            <input
              type="url"
              value={element.src || ''}
              onChange={(event) =>
                setProperty(
                  'src',
                  event.target.value
                )
              }
              className="mt-1 w-full rounded bg-slate-800 p-2 text-slate-100"
              placeholder="https://..."
            />
          </label>
        )}

      {/* SHAPE SETTINGS */}

      {(element.type ===
        'shape_rect' ||
        element.type ===
        'shape_circle') && (
          <>
            <label className="mt-3 block text-xs text-slate-400">
              Fill color

              <input
                type="color"
                value={
                  element.fill || '#cbd5e1'
                }
                onChange={(event) =>
                  setProperty(
                    'fill',
                    event.target.value
                  )
                }
                className="mt-1 block h-8 w-full"
              />
            </label>

            <label className="mt-3 block text-xs text-slate-400">
              Stroke color

              <input
                type="color"
                value={
                  element.stroke ||
                  '#334155'
                }
                onChange={(event) =>
                  setProperty(
                    'stroke',
                    event.target.value
                  )
                }
                className="mt-1 block h-8 w-full"
              />
            </label>

            <label className="mt-3 block text-xs text-slate-400">
              Stroke width

              <input
                type="number"
                min="0"
                value={
                  element.strokeWidth || 0
                }
                onChange={(event) =>
                  setProperty(
                    'strokeWidth',
                    Number(
                      event.target.value
                    )
                  )
                }
                className="mt-1 w-full rounded bg-slate-800 p-2 text-slate-100"
              />
            </label>
          </>
        )}
    </>
  );
}
