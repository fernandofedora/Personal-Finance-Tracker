Feature: User login

  As a user who wants to access the system
  I want the system to show an error if I enter incorrect credentials
  So that unauthorized access is prevented

  Scenario: User attempts to log in with incorrect credentials
    Given the user is on the login page
    When the user enters "incorrect_user" as the username and "wrong_password" as the password
    And clicks the "Login" button
    Then the system should display an error message "Incorrect credentials"
    And the user should not be redirected to the dashboard
