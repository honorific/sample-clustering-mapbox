const getListeners = (component) => {
  return Object.fromEntries(
    Object.entries(component.props) // Get the props
      .filter(([key, value]) => key.startsWith('on')), // Filter event listeners
  )
}

export default getListeners
