describe('Profile', () => {
  context('Hitting the real API', () => {
    beforeEach(() => {
      cy.intercept('/users/*').as('getUser')
      cy.intercept('/users/**/friends').as('getFriends')
      cy.visit('/')
      cy.contains('h1', 'Profile').should('be.visible')
      cy.wait('@getUser')
      cy.wait('@getFriends')
    })

    it('renders the profile with friends', () => {
      cy.contains('Juntao Qiu').should('be.visible')
      cy.contains('p', 'Developer, Educator, Author').should('be.visible')

      cy.contains('h2', 'Friends').should('be.visible')
      cy.contains('Abruzzi').should('be.visible')
      cy.contains('Bob Smith').should('be.visible')
      cy.contains('Carol White').should('be.visible')

      cy.get('img').should('have.length', 4)
    })
  })

  context('Mocking the API', () => {
    context('Transitory state', () => {
      it('renders a "Loading..." fallback while fetching', () => {
        cy.intercept(
          'GET',
          '/users/*',
          {
            delay: 1000,
            fixture: 'user'
          }
        ).as('getDelayedUser')
        cy.intercept(
          'GET',
          '/users/**/friends',
          {
            delay: 1000,
            fixture: 'friends'
          }
        ).as('getDelayedFriends')
        cy.intercept(
          'GET',
          '*.png',
          { fixture: 'walmyr'}
        )

        cy.visit('/')

        cy.contains('Loading...').should('be.visible')

        cy.wait('@getDelayedUser')
        cy.wait('@getDelayedFriends')

        cy.contains('Loading...').should('not.exist')
      })
    })

    context('Error state', () => {
      it('renders a fallback error when failing to fetch user data due to a network failure', () => {
        cy.intercept(
          'GET',
          '/users/*',
          { forceNetworkError: true }
        ).as('getUserError')

        cy.visit('/')

        cy.contains('Something went wrong...').should('be.visible')
      })

      it('renders a fallback error when failing to fetch friends data due to a network failure', () => {
        cy.intercept(
          'GET',
          '/users/**/friends',
          { forceNetworkError: true }
        ).as('getFriendsError')

        cy.visit('/')

        cy.contains('Something went wrong...').should('be.visible')
      })
    })
  })
})
