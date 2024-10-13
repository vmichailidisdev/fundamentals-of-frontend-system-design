import { intersectionObserver } from '../../../utils/observer.js'

/**
 * Standard Margin between cards
 * @type {number}
 */
const MARGIN = 16

/**
 * Returns top and bottom observer elements
 * @returns {[HTMLElement,HTMLElement]}
 */
const getObservers = () => [
  document.getElementById('top-observer'),
  document.getElementById('bottom-observer'),
]

/**
 * Returns a virtual list container
 * @returns {HTMLElement}
 */
function getVirtualList() {
  return document.getElementById('virtual-list')
}

/**
 * Returns a main app container
 * @returns {HTMLElement}
 */
function getContainer() {
  return document.getElementById('container')
}

/**
 * Returns `data-y` attribute of the HTMLElement, if value is provided
 * additionally updates the attribute
 *
 * @param element {HTMLElement}
 * @param value {string | number}
 * @returns {?number}
 */
function y(element, value = undefined) {
  if (value != null) {
    element?.setAttribute('data-y', value)
  }
  const y = element?.getAttribute('data-y')
  if (y !== '' && y != null && +y === +y) {
    return +y
  }
  return null
}

/**
 * Returns a CSS Transform Style string to Move Element by certain amount of pixels
 * @param value      - value in pixels
 * @returns {string}
 */
function translateY(value) {
  return `translateY(${value}px)`
}

/**
 * Starter skeleton
 */
export class VirtualList {
  /**
   * @param root
   * @param props {{
   *     getPage: <T>(p: number) => Promise<T[]>,
   *     getTemplate: <T>(datum: T) => HTMLElement,
   *     updateTemplate: <T>(datum: T, element: HTMLElement) => HTMLElement,
   *     pageSize: number
   * }}
   */
  constructor(root, props) {
    this.props = { ...props }
    this.root = root
    this.start = 0
    this.end = 0
    this.pool = []
    this.poolLimit = this.props.pageSize * 2
  }

  /**
   * Returns an HTML Representation of the component, should have the following structure:
   * #container>
   *    #top-observer+
   *    #virtual-list+
   *    #bottom-observer
   * @returns {string}
   */
  toHTML() {
    /**
     * Part 1 - App Skeleton
     *  @todo
     */
    return `
        <div id="container">
          <div id="top-observer"></div>
          <div id="virtual-list"></div>
          <div id="bottom-observer"></div>
        </div>
        `.trim()
  }

  /**
   * @returns void
   */
  #effect() {
    intersectionObserver(getObservers(), this.#handleIntersectionObserver(), {})
  }

  /**
   * @returns void
   */
  render() {
    this.root.innerHTML = this.toHTML()
    this.#effect()
  }

  /**
   * Handles observer intersection entries
   * @param entries {IntersectionObserverEntry[]}
   */
  #handleIntersectionObserver(entries) {
    return (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        switch (entry.target.id) {
          case 'top-observer':
            void this.#handleTopObserver()
            break
          case 'bottom-observer':
            void this.#handleBottomObserver()
            break
          default:
            throw new Error('Unknown intersection observer entry!')
        }
      })
  }

  async #handleBottomObserver() {
    const list = getVirtualList()
    const data = await this.props.getPage(this.end++)
    const fragment = new DocumentFragment()
    const elements = data.map((datum) => this.props.getTemplate(datum))
    elements.forEach((element) => {
      fragment.appendChild(element)
    })
    if (this.pool.length < this.poolLimit) {
      this.pool.push(...elements)
      list.appendChild(fragment)
    } else {
      const recycled = this.pool.slice(0, this.props.pageSize)
      const unchanged = this.pool.slice(this.props.pageSize)
      this.#updateData(recycled, data)
      this.pool = [...unchanged, ...recycled]
      this.start++
    }
  }

  async #handleTopObserver() {
    return
  }

  /**
   * Function uses `props.getTemplate` to update the html elements
   * using provided data
   *
   * @param elements {HTMLElement[]} - HTML Elements to update
   * @param data {T[]} - Data to use for update
   */
  #updateData(elements, data) {
    for (let i = 0; data.length; i++) {
      this.props.updateTemplate(data[i], elements[i])
    }
  }

  /**
   * Move elements on the screen using CSS Transform
   *
   * @param direction {"top" | "down" }
   */
  #updateElementsPosition(direction) {
    const [top, bottom] = getObservers()
    if (direction === 'down') {
    } else if (direction === 'top') {
      // To implement
    }
  }
}
