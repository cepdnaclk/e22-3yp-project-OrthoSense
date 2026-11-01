# Routes and Permissions

These are planned frontend routes, not confirmed backend endpoints. A
route group such as `(workspace)` does not appear in the browser URL.

## 1. Route inventory

  -----------------------------------------------------------------------------------
  Route                     Audience            Purpose             MVP priority
  ------------------------- ------------------- ------------------- -----------------
  `/`                       Public              Product landing     P1
                                                page                

  `/login`                  Public              Sign-in UI          P1

  `/forgot-password`        Public              Password recovery   P2
                                                UI                  

  `/privacy`                Public              Privacy information P2

  `/accessibility`          Public              Accessibility       P2
                                                statement           

  `/dashboard`              Clinician           Overview, recent    P1
                                                sessions, alerts,   
                                                device state        

  `/patients`               Clinician           Searchable patient  P1
                                                directory           

  `/patients/[patientId]`   Clinician           Patient overview,   P1
                                                sessions, trends    

  `/sessions`               Clinician           Session list and    P1
                                                filters             

  `/sessions/[sessionId]`   Clinician           Detailed session    P1
                                                measurements        

  `/monitoring`             Authorized staff    Live monitoring     P2
                                                shell and data      
                                                freshness           

  `/alerts`                 Clinician           Alert list,         P1
                                                details,            
                                                acknowledgement     

  `/devices`                Clinician/Admin     Device inventory    P1
                                                and status          

  `/devices/[deviceId]`     Clinician/Admin     Device details and  P2
                                                sensor health       

  `/reports`                Clinician/Patient   Report preview and  P2
                            as authorized       export              

  `/settings`               Signed-in user      Account and         P2
                                                notification        
                                                preferences         

  `/my-dashboard`           Patient             Personal overview   P1

  `/my-sessions`            Patient             Own session history P1

  `/my-progress`            Patient             Own permitted       P1
                                                trends              

  `/my-device`              Patient             Own device and data P2
                                                status              

  `/admin/users`            Admin               User/role/account   P2
                                                management          

  `/admin/audit-log`        Admin               Audit-event review, P2
                                                if supported        
  -----------------------------------------------------------------------------------

P1 means core MVP; P2 means subsequent MVP increment, subject to project
schedule.

## 2. Role definitions

-   **Clinician:** Can access assigned patients and their permitted
    sessions, measurements, devices, alerts, and reports. Can
    acknowledge alerts if the backend grants permission.
-   **Patient:** Can access only their own permitted profile, sessions,
    measurements, device information, and reports.
-   **Administrator:** Can manage approved user/device metadata and view
    audit events where supported. Administrative access does not
    automatically grant permission to modify clinical data.
-   **Unauthenticated visitor:** Can access public pages only.

These are proposed roles. Confirm the actual permission model with the
project owner and backend developer.

## 3. Permission matrix

  ----------------------------------------------------------------------------------------
  Capability                Visitor             Clinician         Patient            Admin
  ------------------ -------------- --------------------- --------------- ----------------
  View public                   Yes                   Yes             Yes              Yes
  landing/privacy                                                         
  pages                                                                   

  View clinician                 No                   Yes              No         Optional
  dashboard                                                               

  Search patient                 No        Assigned scope              No    Limited admin
  directory                                                                  metadata only

  View patient                   No        Assigned scope   Own data only          Only if
  clinical/session                                                              explicitly
  data                                                                          authorized

  View device status             No        Assigned scope Own device only   Administrative
                                                                                     scope

  View alerts                    No        Assigned scope  Only permitted   Metadata/audit
                                                                 personal         scope as
                                                            notifications         approved

  Acknowledge                    No          If permitted   No by default          Only if
  clinician alert                                                               explicitly
                                                                                   granted

  View own sessions              No                    If             Yes   Not by default
                                      assigned/authorized                 

  Manage users/roles             No                    No              No          Yes, if
                                                                                 supported

  View audit log                 No         No by default              No          Yes, if
                                                                                 supported

  Export report                  No          If permitted   Own report if   Not by default
                                                                permitted 
  ----------------------------------------------------------------------------------------

## 4. Authorization requirements

-   Hiding navigation is a UX feature, not a security boundary.
-   The backend must verify identity and permission on every protected
    read/write.
-   Patient IDs supplied by the browser must not grant access to another
    patient's data.
-   The frontend should handle `401` (unauthenticated) and `403`
    (forbidden) responses distinctly.
-   Never expose access tokens or private device credentials in
    client-side source.
-   Do not add role-switching or authentication bypasses to production
    builds.
-   Log sensitive administrative changes in the backend where required.

## 5. Navigation acceptance criteria

-   Every visible navigation link has a valid destination.
-   Active route state is clear to sighted and assistive-technology
    users.
-   Mobile navigation can be operated by keyboard.
-   Unauthorized routes display an appropriate access-denied state.
-   A not-found patient/session/device shows a not-found state rather
    than fabricated details.
